package qwerty.chaekit.controller.ebook;

import io.swagger.v3.oas.annotations.Parameter;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;
import qwerty.chaekit.dto.ebook.credit.CreditProductInfoResponse;
import qwerty.chaekit.dto.ebook.credit.CreditTransactionResponse;
import qwerty.chaekit.dto.ebook.credit.CreditWalletResponse;
import qwerty.chaekit.dto.ebook.credit.payment.CreditPaymentApproveResponse;
import qwerty.chaekit.dto.ebook.credit.payment.CreditPaymentReadyRequest;
import qwerty.chaekit.dto.page.PageResponse;
import qwerty.chaekit.global.response.ApiSuccessResponse;
import qwerty.chaekit.global.security.resolver.Login;
import qwerty.chaekit.global.security.resolver.UserToken;
import qwerty.chaekit.service.ebook.credit.CreditService;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/credits")
public class CreditController {
    private final CreditService creditService;

    @GetMapping
    public ApiSuccessResponse<List<CreditProductInfoResponse>> getCreditProductList() {
        return ApiSuccessResponse.of(creditService.getCreditProductList());
    }

    @PostMapping("/payment/ready")
    public ApiSuccessResponse<String> requestKakaoPay(
            @Parameter(hidden = true) @Login UserToken userToken,
            @RequestBody CreditPaymentReadyRequest request
    ) {
        String redirectUrl = creditService.requestKakaoPay(userToken, request);
        return ApiSuccessResponse.of(redirectUrl);
    }

    /**
     * 카카오페이 결제 성공 콜백
     * - 카카오페이가 pg_token과 함께 redirect
     * - 이 요청을 받아 결제 승인 → 크레딧 지급 → 트랜잭션 기록
     */
    @GetMapping("/payment/success")
    public ApiSuccessResponse<CreditPaymentApproveResponse> kakaoPaySuccess(
            @Parameter(hidden = true) @Login UserToken userToken,
            @RequestParam String pgToken) {
        return ApiSuccessResponse.of(creditService.approveKakaoPayPayment(userToken, pgToken));
    }

    @GetMapping("/wallet")
    public ApiSuccessResponse<CreditWalletResponse> getMyWallet(
            @Parameter(hidden = true) @Login UserToken userToken
    ) {
        return ApiSuccessResponse.of(creditService.getMyWallet(userToken));
    }

    @GetMapping("/wallet/transactions")
    public ApiSuccessResponse<PageResponse<CreditTransactionResponse>> getMyWalletTransactions(
            @Parameter(hidden = true) @Login UserToken userToken,
            @ParameterObject Pageable pageable
    ) {
        return ApiSuccessResponse.of(creditService.getMyWalletTransactions(userToken, pageable));
    }
}
