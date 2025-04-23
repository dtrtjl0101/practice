package qwerty.chaekit.controller.ebook;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;
import qwerty.chaekit.dto.ebook.EbookFetchResponse;
import qwerty.chaekit.dto.ebook.upload.EbookDownloadResponse;
import qwerty.chaekit.dto.ebook.upload.EbookPostRequest;
import qwerty.chaekit.dto.page.PageResponse;
import qwerty.chaekit.global.response.ApiSuccessResponse;
import qwerty.chaekit.global.security.resolver.Login;
import qwerty.chaekit.global.security.resolver.PublisherToken;
import qwerty.chaekit.global.security.resolver.UserToken;
import qwerty.chaekit.service.ebook.EbookFileService;
import qwerty.chaekit.service.ebook.EbookService;

@RestController
@RequestMapping("/api/books")
@RequiredArgsConstructor
@Tag(name = "Ebook", description = "전자책 관련 API")
public class EbookController {
    public final EbookService ebookService;
    public final EbookFileService ebookFileService;

    @GetMapping
    @Operation(summary = "전자책 목록 조회", description = "전자책 목록을 페이지네이션하여 조회합니다.")
    public ApiSuccessResponse<PageResponse<EbookFetchResponse>> getBooks(
            @Parameter(description = "페이지네이션 정보") @ParameterObject Pageable pageable) {
        return ApiSuccessResponse.of(ebookService.fetchEbookList(pageable));
    }

    @PostMapping
    @Operation(summary = "전자책 업로드", description = "출판사가 전자책 파일과 정보를 업로드합니다.")
    public ApiSuccessResponse<String> uploadFile(
            @Parameter(description = "로그인된 출판사 정보") @Login PublisherToken publisherToken,
            @Parameter(description = "전자책 업로드 요청 데이터") @ModelAttribute EbookPostRequest request) {
        return ApiSuccessResponse.of(ebookFileService.uploadEbook(publisherToken, request));
    }

    @GetMapping("/download/{ebookId}")
    @Operation(summary = "전자책 다운로드 URL 생성", description = "관리자가 전자책 다운로드를 위한 URL을 생성합니다.")
    public ApiSuccessResponse<EbookDownloadResponse> downloadFile(
            @Parameter(description = "로그인된 사용자 정보") @Login UserToken userToken,
            @Parameter(description = "다운로드할 전자책 ID") @PathVariable Long ebookId) {
        return ApiSuccessResponse.of(ebookFileService.getPresignedEbookUrl(userToken, ebookId));
    }
}
