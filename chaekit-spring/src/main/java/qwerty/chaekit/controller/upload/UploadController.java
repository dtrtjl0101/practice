package qwerty.chaekit.controller.upload;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import qwerty.chaekit.dto.upload.UploadUrlResponse;
import qwerty.chaekit.global.response.ApiSuccessResponse;
import qwerty.chaekit.global.security.resolver.Login;
import qwerty.chaekit.global.security.resolver.PublisherToken;
import qwerty.chaekit.global.security.resolver.UserToken;
import qwerty.chaekit.service.util.UploadService;

@RestController
@RequestMapping("/api/uploads")
@RequiredArgsConstructor
@Tag(name = "Upload API", description = "파일 업로드를 위한 Presigned URL을 생성하는 API")
public class UploadController {
    private final UploadService uploadService;

    @GetMapping("/book")
    @Operation(summary = "전자책 업로드 URL 생성", description = "출판사 회원이 전자책 파일을 업로드하기 위한 Presigned URL을 생성합니다.")
    public ApiSuccessResponse<UploadUrlResponse> getEbookUploadUrl(
            @Login PublisherToken token,
            @RequestParam String extension,
            @RequestParam long size
    ) {
        return ApiSuccessResponse.of(uploadService.getUrlForEbookUpload(extension, size));
    }

    @GetMapping("/book-cover")
    @Operation(summary = "전자책 표지 업로드 URL 생성", description = "출판사 회원이 전자책 표지 이미지를 업로드하기 위한 Presigned URL을 생성합니다.")
    public ApiSuccessResponse<UploadUrlResponse> getEbookCoverImageUploadUrl(
            @Login PublisherToken token,
            @RequestParam String extension,
            @RequestParam long size
    ) {
        return ApiSuccessResponse.of(uploadService.getUrlForEbookCoverImageUpload(extension, size));
    }

    @GetMapping("/profile-image")
    @Operation(summary = "프로필 이미지 업로드 URL 생성", description = "사용자 프로필 이미지를 업로드하기 위한 Presigned URL을 생성합니다.")
    public ApiSuccessResponse<UploadUrlResponse> getProfileImageUploadUrl(
            @Login UserToken token,
            @RequestParam String extension,
            @RequestParam long size
    ) {
        return ApiSuccessResponse.of(uploadService.getUrlForProfileImageUpload(extension, size));
    }

    @GetMapping("/group-image")
    @Operation(summary = "그룹 이미지 업로드 URL 생성", description = "그룹 이미지를 업로드하기 위한 Presigned URL을 생성합니다.")
    public ApiSuccessResponse<UploadUrlResponse> getGroupImageUploadUrl(
            @Login UserToken token,
            @RequestParam String extension,
            @RequestParam long size
    ) {
        return ApiSuccessResponse.of(uploadService.getUrlForGroupImageUpload(extension, size));
    }
}
