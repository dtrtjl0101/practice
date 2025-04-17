package qwerty.chaekit.controller.member.admin;

import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;
import qwerty.chaekit.dto.ebook.upload.EbookDownloadResponse;
import qwerty.chaekit.dto.ebook.upload.EbookUploadRequest;
import qwerty.chaekit.dto.member.PublisherInfoResponse;
import qwerty.chaekit.dto.page.PageResponse;
import qwerty.chaekit.global.response.ApiSuccessResponse;
import qwerty.chaekit.service.ebook.EbookFileService;
import qwerty.chaekit.service.member.admin.AdminService;

import java.io.IOException;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {
    private final AdminService adminService;
    private final EbookFileService ebookFileService;

    @GetMapping("/publishers/pending")
    public ApiSuccessResponse<PageResponse<PublisherInfoResponse>> fetchPendingList(@ParameterObject Pageable pageable) {
        return ApiSuccessResponse.of(adminService.getNotAcceptedPublishers(pageable));
    }

    @PostMapping("/publishers/{publisherId}/accept")
    public ApiSuccessResponse<Boolean> acceptPublisher(@PathVariable Long publisherId) {
        return ApiSuccessResponse.of(adminService.acceptPublisher(publisherId));
    }

    @PostMapping("/books/upload")
    public ApiSuccessResponse<String> uploadFile(@ModelAttribute EbookUploadRequest request) throws IOException {
        return ApiSuccessResponse.of(ebookFileService.uploadEbookByAdmin(request));
    }

    @GetMapping("/books/{ebookId}")
    public ApiSuccessResponse<EbookDownloadResponse> downloadFile(@PathVariable Long ebookId) {
        return ApiSuccessResponse.of(ebookFileService.getPresignedEbookUrl(ebookId));
    }
}
