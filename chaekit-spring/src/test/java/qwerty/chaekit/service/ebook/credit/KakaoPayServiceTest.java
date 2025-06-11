package qwerty.chaekit.service.ebook.credit;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.http.*;
import org.springframework.web.client.RestTemplate;
import qwerty.chaekit.dto.ebook.credit.payment.CreditPaymentReadyRequest;
import qwerty.chaekit.dto.external.kakaopay.Amount;
import qwerty.chaekit.dto.external.kakaopay.KakaoPayApproveResponse;
import qwerty.chaekit.dto.external.kakaopay.KakaoPayCancelResponse;
import qwerty.chaekit.dto.external.kakaopay.KakaoPayReadyResponse;
import qwerty.chaekit.global.constant.CreditProduct;
import qwerty.chaekit.global.enums.ErrorCode;
import qwerty.chaekit.global.exception.BadRequestException;
import qwerty.chaekit.global.properties.KakaoPayProperties;
import qwerty.chaekit.global.security.resolver.UserToken;
import qwerty.chaekit.service.ebook.credit.exception.PaymentCancelFailedException;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class KakaoPayServiceTest {

    @InjectMocks
    private KakaoPayService kakaoPayService;

    @Mock
    private RestTemplate restTemplate;

    @Mock
    private KakaoPayProperties kakaoPayProperties;

    @Mock
    private RedisTemplate<String, String> redisTemplate;

    @Mock
    private ValueOperations<String, String> valueOperations;

    @Test
    @DisplayName("카카오페이 결제 요청 성공")
    void requestKakaoPay_Success() {
        // given
        Long userId = 1L;
        UserToken userToken = UserToken.of(userId, userId, "test@test.com");
        CreditPaymentReadyRequest request = new CreditPaymentReadyRequest(1L);

        KakaoPayReadyResponse readyResponse = new KakaoPayReadyResponse(
                "test-tid",
                "https://test-redirect-url.com"
        );

        ResponseEntity<KakaoPayReadyResponse> responseEntity = new ResponseEntity<>(readyResponse, HttpStatus.OK);

        when(kakaoPayProperties.cid()).thenReturn("test-cid");
        when(kakaoPayProperties.secretKey()).thenReturn("test-secret-key");
        when(kakaoPayProperties.redirectBaseUrl()).thenReturn("http://test.com");
        when(restTemplate.postForEntity(
                eq("https://open-api.kakaopay.com/online/v1/payment/ready"),
                any(HttpEntity.class),
                eq(KakaoPayReadyResponse.class)
        )).thenReturn(responseEntity);
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);

        // when
        String redirectUrl = kakaoPayService.requestKakaoPay(userToken, request);

        // then
        assertThat(redirectUrl).isEqualTo(readyResponse.next_redirect_pc_url());
        verify(redisTemplate.opsForValue()).set(eq("kakao:tid:" + userId), eq("test-tid"), any());
        verify(redisTemplate.opsForValue()).set(eq("kakao:orderId:test-tid"), any(), any());
    }

    @Test
    @DisplayName("카카오페이 결제 승인 성공")
    void approveKakaoPayPayment_Success() {
        // given
        Long userId = 1L;
        String pgToken = "test-pg-token";
        String tid = "test-tid";
        String orderId = "test-order-id";

        KakaoPayApproveResponse approveResponse = new KakaoPayApproveResponse(
                "test-tid",
                orderId,
                "test-user-id",
                "1",
                new Amount(1000, 0, 0, 0, 0),
                null,
                "test-product",
                "CARD",
                1,
                LocalDateTime.now(),
                LocalDateTime.now()
        );

        ResponseEntity<KakaoPayApproveResponse> responseEntity = new ResponseEntity<>(approveResponse, HttpStatus.OK);

        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get("kakao:tid:" + userId)).thenReturn(tid);
        when(valueOperations.get("kakao:orderId:" + tid)).thenReturn(orderId);
        when(kakaoPayProperties.cid()).thenReturn("test-cid");
        when(kakaoPayProperties.secretKey()).thenReturn("test-secret-key");
        when(restTemplate.postForEntity(
                eq("https://open-api.kakaopay.com/online/v1/payment/approve"),
                any(HttpEntity.class),
                eq(KakaoPayApproveResponse.class)
        )).thenReturn(responseEntity);

        // when
        KakaoPayApproveResponse response = kakaoPayService.approveKakaoPayPayment(userId, pgToken);

        // then
        assertThat(response.tid()).isEqualTo(approveResponse.tid());
        assertThat(response.partner_order_id()).isEqualTo(approveResponse.partner_order_id());
        assertThat(response.payment_method_type()).isEqualTo(approveResponse.payment_method_type());
        verify(redisTemplate).delete("kakao:tid:" + userId);
        verify(redisTemplate).delete(orderId);
    }

    @Test
    @DisplayName("카카오페이 결제 취소 성공")
    void cancelKakaoPayPayment_Success() {
        // given
        String tid = "test-tid";
        long amount = 1000L;

        KakaoPayCancelResponse cancelResponse = new KakaoPayCancelResponse(
                "test-tid",
                "CANCEL_PAYMENT",
                "test-order-id",
                "test-user-id",
                "CARD",
                new Amount(1000, 0, 0, 0, 0),
                null,
                LocalDateTime.now().toString(),
                null
        );

        ResponseEntity<KakaoPayCancelResponse> responseEntity = new ResponseEntity<>(cancelResponse, HttpStatus.OK);

        when(kakaoPayProperties.cid()).thenReturn("test-cid");
        when(kakaoPayProperties.secretKey()).thenReturn("test-secret-key");
        when(restTemplate.postForEntity(
                eq("https://open-api.kakaopay.com/online/v1/payment/cancel"),
                any(HttpEntity.class),
                eq(KakaoPayCancelResponse.class)
        )).thenReturn(responseEntity);

        // when
        kakaoPayService.cancelKakaoPayPayment(tid, amount);

        // then
        verify(restTemplate).postForEntity(
                eq("https://open-api.kakaopay.com/online/v1/payment/cancel"),
                any(HttpEntity.class),
                eq(KakaoPayCancelResponse.class)
        );
    }

    @Test
    @DisplayName("카카오페이 결제 취소 실패")
    void cancelKakaoPayPayment_Failure() {
        // given
        String tid = "test-tid";
        long amount = 1000L;

        KakaoPayCancelResponse cancelResponse = new KakaoPayCancelResponse(
                "test-tid",
                "FAILED",
                null,
                null,
                null,
                new Amount(1000, 0, 0, 0, 0),
                null,
                LocalDateTime.now().toString(),
                null
        );

        ResponseEntity<KakaoPayCancelResponse> responseEntity = new ResponseEntity<>(cancelResponse, HttpStatus.OK);

        when(kakaoPayProperties.cid()).thenReturn("test-cid");
        when(kakaoPayProperties.secretKey()).thenReturn("test-secret-key");
        when(restTemplate.postForEntity(
                eq("https://open-api.kakaopay.com/online/v1/payment/cancel"),
                any(HttpEntity.class),
                eq(KakaoPayCancelResponse.class)
        )).thenReturn(responseEntity);

        // when & then
        assertThatThrownBy(() -> kakaoPayService.cancelKakaoPayPayment(tid, amount))
                .isInstanceOf(PaymentCancelFailedException.class)
                .hasMessage("카카오페이 환불 처리가 실패했습니다.");
    }

    @Test
    @DisplayName("유효하지 않은 결제 세션으로 승인 시도")
    void approveKakaoPayPayment_InvalidSession() {
        // given
        Long userId = 1L;
        String pgToken = "test-pg-token";

        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get("kakao:tid:" + userId)).thenReturn(null);

        // when & then
        assertThatThrownBy(() -> kakaoPayService.approveKakaoPayPayment(userId, pgToken))
                .isInstanceOf(BadRequestException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.INVALID_PAYMENT_SESSION.getCode());
    }
} 