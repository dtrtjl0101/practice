package qwerty.chaekit.service.ebook.credit;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import qwerty.chaekit.dto.ebook.credit.payment.CreditPaymentReadyRequest;
import qwerty.chaekit.dto.external.kakaopay.KakaoPayApproveResponse;
import qwerty.chaekit.dto.external.kakaopay.KakaoPayCancelResponse;
import qwerty.chaekit.dto.external.kakaopay.KakaoPayReadyResponse;
import qwerty.chaekit.global.constant.CreditProduct;
import qwerty.chaekit.global.enums.ErrorCode;
import qwerty.chaekit.global.exception.BadRequestException;
import qwerty.chaekit.global.properties.KakaoPayProperties;
import qwerty.chaekit.global.security.resolver.UserToken;
import qwerty.chaekit.service.ebook.credit.exception.PaymentCancelFailedException;

import java.time.Duration;
import java.util.Arrays;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
public class KakaoPayService {
    private static final String KAKAO_PAY_READY_URL = "https://open-api.kakaopay.com/online/v1/payment/ready";
    private static final String KAKAO_PAY_CANCEL_URL = "https://open-api.kakaopay.com/online/v1/payment/cancel";
    private static final String KAKAO_PAY_APPROVE_URL = "https://open-api.kakaopay.com/online/v1/payment/approve";
    private static final String REDIS_TID_KEY_PREFIX = "kakao:tid:";
    private static final String REDIS_ORDER_ID_KEY_PREFIX = "kakao:orderId:";
    private static final Duration REDIS_KEY_EXPIRATION = Duration.ofMinutes(10);

    private final RestTemplate restTemplate;
    private final KakaoPayProperties kakaoPayProperties;
    private final RedisTemplate<String, String> redisTemplate;

    @Transactional
    public String requestKakaoPay(UserToken userToken, CreditPaymentReadyRequest request) {
        Long creditProductId = request.creditProductId();
        CreditProduct product = findCreditProductById(creditProductId);
        String orderId = UUID.randomUUID().toString();

        HttpEntity<MultiValueMap<String, String>> httpEntity = createKakaoPayRequest(userToken, product, orderId);
        ResponseEntity<KakaoPayReadyResponse> response = restTemplate.postForEntity(
                KAKAO_PAY_READY_URL, httpEntity, KakaoPayReadyResponse.class
        );

        return handleKakaoPayResponse(response, userToken.userId(), orderId);
    }

    private CreditProduct findCreditProductById(Long creditProductId) {
        return Arrays.stream(CreditProduct.values())
                .filter(p -> p.id == creditProductId)
                .findFirst()
                .orElseThrow(() -> new BadRequestException(ErrorCode.INVALID_CREDIT_PRODUCT_ID));
    }

    private HttpEntity<MultiValueMap<String, String>> createKakaoPayRequest(UserToken userToken, CreditProduct product,
                                                                            String orderId) {
        HttpHeaders headers = createKakaoPayHeaders();
        MultiValueMap<String, String> body = createKakaoPayRequestBody(userToken, product, orderId);
        return new HttpEntity<>(body, headers);
    }

    private MultiValueMap<String, String> createKakaoPayRequestBody(UserToken userToken, CreditProduct product,
                                                                    String orderId) {
        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("cid", kakaoPayProperties.cid());
        body.add("partner_order_id", orderId);
        body.add("partner_user_id", String.valueOf(userToken.userId()));
        body.add("item_name", product.getName());
        body.add("item_code", String.valueOf(product.id));
        body.add("quantity", "1");
        body.add("total_amount", String.valueOf(product.price));
        body.add("tax_free_amount", "0");

        String redirectBaseUrl = kakaoPayProperties.redirectBaseUrl();
        body.add("approval_url", redirectBaseUrl + "/credits/payment/success");
        body.add("cancel_url", redirectBaseUrl + "/credits/payment/cancel");
        body.add("fail_url", redirectBaseUrl + "/credits/payment/fail");

        return body;
    }

    private String handleKakaoPayResponse(ResponseEntity<KakaoPayReadyResponse> response, Long userId,
                                          String orderId) {
        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            String tid = response.getBody().tid();

            // save tid, orderId to Redis
            String tidKey = REDIS_TID_KEY_PREFIX + userId;
            redisTemplate.opsForValue().set(tidKey, tid, REDIS_KEY_EXPIRATION);

            String orderIdKey = REDIS_ORDER_ID_KEY_PREFIX + tid;
            redisTemplate.opsForValue().set(orderIdKey, orderId, REDIS_KEY_EXPIRATION);

            return response.getBody().next_redirect_pc_url(); // pc only
        }
        throw new IllegalStateException("카카오페이 요청 실패");
    }

    @Transactional
    public void cancelKakaoPayPayment(String tid, long amount) {
        HttpEntity<MultiValueMap<String, String>> httpEntity = createKakaoPayCancelRequest(tid, amount);

        ResponseEntity<KakaoPayCancelResponse> response = restTemplate.postForEntity(
                KAKAO_PAY_CANCEL_URL,
                httpEntity,
                KakaoPayCancelResponse.class
        );

        if (!response.getStatusCode().is2xxSuccessful()
                || response.getBody() == null
                || !response.getBody().status().equals("CANCEL_PAYMENT")) {
            throw new PaymentCancelFailedException("카카오페이 환불 처리가 실패했습니다.");
        }
    }

    private HttpEntity<MultiValueMap<String, String>> createKakaoPayCancelRequest(String tid, long amount) {
        HttpHeaders headers = createKakaoPayHeaders();
        MultiValueMap<String, String> body = createKakaoPayCancelRequestBody(tid, amount);
        return new HttpEntity<>(body, headers);
    }

    private MultiValueMap<String, String> createKakaoPayCancelRequestBody(String tid, long amount) {
        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("cid", kakaoPayProperties.cid());
        body.add("tid", tid);
        body.add("cancel_amount", String.valueOf(amount));
        body.add("cancel_tax_free_amount", "0");

        return body;
    }

    @Transactional(readOnly = true)
    public String loadKakaoPayTid(Long userId) {
        String redisKey = REDIS_TID_KEY_PREFIX + userId;
        String tid = redisTemplate.opsForValue().get(redisKey);
        if (tid == null) {
            throw new BadRequestException(ErrorCode.INVALID_PAYMENT_SESSION);
        }
        redisTemplate.delete(redisKey);
        return tid;
    }

    @Transactional(readOnly = true)
    public String loadKakaoPayOrderId(String tid) {
        String orderIdKey = REDIS_ORDER_ID_KEY_PREFIX + tid;
        String orderId = redisTemplate.opsForValue().get(orderIdKey);
        if (orderId == null) {
            throw new BadRequestException(ErrorCode.INVALID_PAYMENT_SESSION);
        }
        redisTemplate.delete(orderId);
        return orderId;
    }

    @Transactional
    public KakaoPayApproveResponse approveKakaoPayPayment(Long userId, String tid, String orderId, String pgToken) {
        HttpEntity<MultiValueMap<String, String>> httpEntity = createKakaoPayApproveRequest(userId, tid, orderId, pgToken);

        ResponseEntity<KakaoPayApproveResponse> response = restTemplate.postForEntity(
                KAKAO_PAY_APPROVE_URL,
                httpEntity,
                KakaoPayApproveResponse.class
        );

        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            return response.getBody();
        }

        throw new IllegalStateException("카카오페이 결제 승인 실패");
    }

    private HttpEntity<MultiValueMap<String, String>> createKakaoPayApproveRequest(Long userId, String tid,
                                                                                   String orderId, String pgToken) {
        HttpHeaders headers = createKakaoPayHeaders();
        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("cid", kakaoPayProperties.cid());
        body.add("tid", tid);
        body.add("partner_order_id", orderId);
        body.add("partner_user_id", String.valueOf(userId));
        body.add("pg_token", pgToken);

        return new HttpEntity<>(body, headers);
    }

    // ==== common methods ====
    private HttpHeaders createKakaoPayHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "SECRET_KEY " + kakaoPayProperties.secretKey());
        return headers;
    }
}
