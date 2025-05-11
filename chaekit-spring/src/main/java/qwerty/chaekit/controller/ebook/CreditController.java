package qwerty.chaekit.controller.ebook;

import io.swagger.v3.oas.annotations.Operation;
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

    @Operation(
            summary = "크레딧 상품 목록 조회",
            description = "크레딧 상품 목록을 조회합니다. (구매 가능 상품만 조회)"
    )
    @GetMapping
    public ApiSuccessResponse<List<CreditProductInfoResponse>> getCreditProductList() {
        return ApiSuccessResponse.of(creditService.getCreditProductList());
    }

    @Operation(
            summary = "카카오페이 결제 redirect URL 요청",
            description = "특정 크레딧 상품에 대해 카카오페이 결제를 요청합니다. (결제 준비)"
    )
    @PostMapping("/payment/ready")
    public ApiSuccessResponse<String> requestKakaoPay(
            @Parameter(hidden = true) @Login UserToken userToken,
            @RequestBody CreditPaymentReadyRequest request
    ) {
        String redirectUrl = creditService.requestKakaoPay(userToken, request);
        return ApiSuccessResponse.of(redirectUrl);
    }

    @Operation(
            summary = "카카오페이 결제 승인",
            description = "카카오페이 결제 승인 후, 결제 정보를 저장합니다. (결제 승인)"
    )
    @PostMapping("/payment/success")
    public ApiSuccessResponse<CreditPaymentApproveResponse> kakaoPaySuccess(
            @Parameter(hidden = true) @Login UserToken userToken,
            @RequestParam(name = "pg_token") String pgToken) {
        return ApiSuccessResponse.of(creditService.approveKakaoPayPayment(userToken, pgToken));
    }

    @Operation(
            summary = "내 크레딧 지갑 조회",
            description = "내 크레딧 지갑 정보를 조회합니다."
    )
    @GetMapping("/wallet")
    public ApiSuccessResponse<CreditWalletResponse> getMyWallet(
            @Parameter(hidden = true) @Login UserToken userToken
    ) {
        return ApiSuccessResponse.of(creditService.getMyWallet(userToken));
    }

    @Operation(
            summary = "내 크레딧 거래 내역 조회",
            description = "내 크레딧 거래 내역을 조회합니다. (구매, 사용 내역 포함)"
    )
    @GetMapping("/wallet/transactions")
    public ApiSuccessResponse<PageResponse<CreditTransactionResponse>> getMyWalletTransactions(
            @Parameter(hidden = true) @Login UserToken userToken,
            @ParameterObject Pageable pageable
    ) {
        return ApiSuccessResponse.of(creditService.getMyWalletTransactions(userToken, pageable));
    }
}
