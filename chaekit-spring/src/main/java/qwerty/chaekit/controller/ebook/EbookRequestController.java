package qwerty.chaekit.controller.ebook;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;
import qwerty.chaekit.dto.ebook.request.EbookRequestFetchResponse;
import qwerty.chaekit.dto.ebook.request.EbookRequestRejectRequest;
import qwerty.chaekit.dto.ebook.upload.EbookDownloadResponse;
import qwerty.chaekit.dto.page.PageResponse;
import qwerty.chaekit.global.response.ApiSuccessResponse;
import qwerty.chaekit.global.security.resolver.Login;
import qwerty.chaekit.global.security.resolver.PublisherToken;
import qwerty.chaekit.service.ebook.EbookFileService;

@RestController
@RequestMapping("/api/book-requests")
@RequiredArgsConstructor
public class EbookRequestController {
    public final EbookFileService ebookFileService;

    @GetMapping
    @Operation(summary = "출판물 요청 목록 조회", description = "대기중인 출판물 목록을 조회합니다. 출판사는 자신의 요청만 조회할 수 있습니다.")
    public ApiSuccessResponse<PageResponse<EbookRequestFetchResponse>> getEbookRequests(
            @Parameter(hidden = true) @Login PublisherToken publisherToken,
            @ParameterObject Pageable pageable
    ) {
        return ApiSuccessResponse.of(ebookFileService.getEbookRequests(publisherToken, pageable));
    }
    
    @PostMapping("/{requestId}/approve")
    @Operation(summary = "출판물 요청 승인", description = "출판사의 출판물 요청을 승인합니다. 관리자가 요청을 승인할 수 있습니다.")
    public ApiSuccessResponse<Void> approveRequest(
            @Parameter(hidden = true) @Login PublisherToken publisherToken,
            @Parameter(description = "승인할 출판물 요청 ID") @PathVariable Long requestId
    ) {
        ebookFileService.approveEbookByAdmin(publisherToken, requestId);
        return ApiSuccessResponse.emptyResponse();
    }

    @PostMapping("/{requestId}/reject")
    @Operation(summary = "출판물 요청 승인", description = "출판사의 출판물 요청을 승인합니다. 관리자가 요청을 승인할 수 있습니다.")
    public ApiSuccessResponse<Void> rejectRequest(
            @Parameter(hidden = true) @Login PublisherToken publisherToken,
            @Parameter(description = "승인할 출판물 요청 ID")  @PathVariable Long requestId,
            @RequestBody EbookRequestRejectRequest requestBody
    ) {
        ebookFileService.rejectEbookByAdmin(publisherToken, requestId, requestBody);
        return ApiSuccessResponse.emptyResponse();
    }
    
    @GetMapping("/{requestId}/download")
    @Operation(summary = "요청된 출판물 다운로드", description = "출판사 또는 관리자가 출판물을 미리 다운로드합니다.")
    public ApiSuccessResponse<EbookDownloadResponse> download(
            @Parameter(hidden = true) @Login PublisherToken publisherToken,
            @Parameter(description = "승인할 출판물 요청 ID")  @PathVariable Long requestId
    ) {
        return ApiSuccessResponse.of(ebookFileService.getPresignedTempEbookUrlForPublisher(publisherToken, requestId));
    }

}
