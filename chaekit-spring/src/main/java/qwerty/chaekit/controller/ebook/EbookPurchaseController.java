package qwerty.chaekit.controller.ebook;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;
import qwerty.chaekit.dto.ebook.EbookFetchResponse;
import qwerty.chaekit.dto.ebook.purchase.EbookPurchaseResponse;
import qwerty.chaekit.dto.page.PageResponse;
import qwerty.chaekit.global.response.ApiSuccessResponse;
import qwerty.chaekit.global.security.resolver.Login;
import qwerty.chaekit.global.security.resolver.UserToken;
import qwerty.chaekit.service.ebook.EbookPurchaseService;

@RestController
@RequestMapping("/api/books")
@RequiredArgsConstructor
public class EbookPurchaseController {
    public final EbookPurchaseService ebookPurchaseService;

//    @PostMapping("/{bookId}/purchase")
//    @Operation(summary = "전자책 구매", description = "보유한 크레딧으로 전자책을 구매합니다.")
//    public ApiSuccessResponse<EbookPurchaseResponse> purchaseEbook(
//            @Parameter(hidden = true) @Login UserToken userToken,
//            @Parameter(description = "전자책 ID") @PathVariable Long bookId
//    ) {
//        return ApiSuccessResponse.of(ebookPurchaseService.purchaseEbook(bookId, userToken.userId()));
//    }

    @GetMapping("/my")
    @Operation(summary = "내 전자책 목록 조회", description = "내가 구매한 전자책 목록을 페이지네이션하여 조회합니다.")
    public ApiSuccessResponse<PageResponse<EbookFetchResponse>> getMyBooks(
            @Parameter(hidden = true) @Login UserToken userToken,
            @Parameter(description = "페이지네이션 정보") @ParameterObject Pageable pageable
    ) {
        return ApiSuccessResponse.of(ebookPurchaseService.getMyBooks(userToken.userId(), pageable));
    }


}
