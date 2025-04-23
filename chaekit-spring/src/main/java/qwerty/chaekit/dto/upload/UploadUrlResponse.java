package qwerty.chaekit.dto.upload;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

@Builder
public record UploadUrlResponse(
    @Schema(description = "파일 업로드를 위한 Presigned URL", example = "https://s3.amazonaws.com/bucket-name/filename?X-Amz-Signature=...")
    String presignedUrl,

    @Schema(description = "S3에 저장될 파일의 키", example = "ebook/123e4567-e89b-12d3-a456-426614174000.epub")
    String fileKey
) {
    public static UploadUrlResponse of(String presignedUrl, String fileKey) {
        return UploadUrlResponse.builder()
                .presignedUrl(presignedUrl)
                .fileKey(fileKey)
                .build();
    }
}

