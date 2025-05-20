package qwerty.chaekit.controller.ebook;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import qwerty.chaekit.dto.ebook.EbookFetchResponse;
import qwerty.chaekit.dto.ebook.upload.EbookDownloadResponse;
import qwerty.chaekit.dto.ebook.upload.EbookPostRequest;
import qwerty.chaekit.dto.ebook.upload.EbookPostResponse;
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
public class EbookController {
    public final EbookService ebookService;
    public final EbookFileService ebookFileService;

    @GetMapping
    @Operation(summary = "전자책 목록 조회", description = "전자책 목록을 페이지네이션하여 조회합니다.")
    public ApiSuccessResponse<PageResponse<EbookFetchResponse>> getBooks(
            @Parameter(hidden = true) @Login(required = false) UserToken userToken,
            @Parameter(description = "페이지네이션 정보") @ParameterObject Pageable pageable,
            @Parameter(description = "책 제목") @RequestParam(required = false) String title,
            @Parameter(description = "작가명") @RequestParam(required = false) String author

    ) {
        return ApiSuccessResponse.of(ebookService.fetchBooksByQuery(userToken, pageable, title, author));
    }

    @GetMapping("/{ebookId}")
    @Operation(summary = "전자책 상세 조회", description = "전자책의 상세 정보를 조회합니다.")
    public ApiSuccessResponse<EbookFetchResponse> getBook(
            @Parameter(hidden = true) @Login UserToken userToken,
            @Parameter(description = "조회할 전자책 ID") @PathVariable Long ebookId
    ) {
        return ApiSuccessResponse.of(ebookService.fetchById(userToken, ebookId));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "전자책 업로드", description = "출판사가 전자책 파일과 정보를 업로드합니다.")
    public ApiSuccessResponse<EbookPostResponse> uploadFile(
            @Parameter(hidden = true) @Login PublisherToken publisherToken,
            @Parameter(description = "전자책 업로드 요청 데이터") @ModelAttribute EbookPostRequest request) {
        return ApiSuccessResponse.of(ebookFileService.uploadEbook(publisherToken, request));
    }

    @GetMapping("/{ebookId}/download")
    @Operation(summary = "전자책 다운로드 URL 생성", description = "관리자가 전자책 다운로드를 위한 URL을 생성합니다.")
    public ApiSuccessResponse<EbookDownloadResponse> downloadFile(
            @Parameter(hidden = true) @Login UserToken userToken,
            @Parameter(description = "다운로드할 전자책 ID") @PathVariable Long ebookId) {
        return ApiSuccessResponse.of(ebookFileService.getPresignedEbookUrl(userToken, ebookId));
    }

}
