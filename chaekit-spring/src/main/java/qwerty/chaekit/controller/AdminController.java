package qwerty.chaekit.controller;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;
import qwerty.chaekit.dto.PublisherInfoResponse;
import qwerty.chaekit.dto.ebook.EbookFetchResponse;
import qwerty.chaekit.dto.page.PageResponse;
import qwerty.chaekit.dto.upload.EbookDownloadResponse;
import qwerty.chaekit.dto.upload.EbookUploadRequest;
import qwerty.chaekit.global.response.ApiSuccessResponse;
import qwerty.chaekit.service.AdminService;
import qwerty.chaekit.service.EbookFileService;
import qwerty.chaekit.service.EbookService;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {
    private final AdminService adminService;
    private final EbookFileService ebookFileService;
    private final EbookService ebookService;

    @GetMapping("/publishers/pending")
    public ApiSuccessResponse<PageResponse<PublisherInfoResponse>> fetchPendingList(@ParameterObject Pageable pageable) {
        return ApiSuccessResponse.of(adminService.getNotAcceptedPublishers(pageable));
    }

    @PostMapping("/publishers/{id}/accept")
    public ApiSuccessResponse<Boolean> acceptPublisher(@PathVariable Long id) {
        return ApiSuccessResponse.of(adminService.acceptPublisher(id));
    }

    @PostMapping("/books/upload")
    public ApiSuccessResponse<String> uploadFile(@ModelAttribute EbookUploadRequest request) throws IOException {
        return ApiSuccessResponse.of(ebookFileService.uploadEbookByAdmin(request));
    }

    @GetMapping("/books/{ebookId}")
    public ApiSuccessResponse<EbookDownloadResponse> downloadFile(@PathVariable Long ebookId) {
        return ApiSuccessResponse.of(ebookFileService.getPresignedEbookUrl(ebookId));
    }

    @GetMapping("/books")
    public ApiSuccessResponse<PageResponse<EbookFetchResponse>> getBooks(@ParameterObject Pageable pageable) {
        return ApiSuccessResponse.of(ebookService.fetchEbookList(pageable));
    }
}
