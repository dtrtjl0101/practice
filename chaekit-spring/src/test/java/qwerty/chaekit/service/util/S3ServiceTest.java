package qwerty.chaekit.service.util;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;
import qwerty.chaekit.global.enums.ErrorCode;
import qwerty.chaekit.global.enums.S3Directory;
import qwerty.chaekit.global.exception.BadRequestException;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;

import java.io.IOException;
import java.net.URL;
import java.time.Duration;
import java.util.List;
import java.util.function.Consumer;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class S3ServiceTest {

    @InjectMocks
    private S3Service s3Service;

    @Mock
    private S3Presigner s3Presigner;

    @Mock
    private S3Client s3Client;

    @Test
    @DisplayName("프리사인드 다운로드 URL 생성 성공")
    void getPresignedDownloadUrl_Success() throws Exception {
        // given
        String bucket = "test-bucket";
        String fileKey = "test/file.jpg";
        Long expirationTime = 3600L;
        String expectedUrl = "https://test-bucket.s3.amazonaws.com/test/file.jpg";

        PresignedGetObjectRequest presignedRequest = mock(PresignedGetObjectRequest.class);
        doReturn(new URL(expectedUrl)).when(presignedRequest).url();
        doReturn(presignedRequest).when(s3Presigner).presignGetObject(any(Consumer.class));

        // when
        String url = s3Service.getPresignedDownloadUrl(bucket, fileKey, expirationTime);

        // then
        assertThat(url).isEqualTo(expectedUrl);
        verify(s3Presigner).presignGetObject(any(Consumer.class));
    }

    @Test
    @DisplayName("파일 업로드 성공")
    void uploadFile_Success() throws IOException {
        // given
        String bucket = "test-bucket";
        S3Directory directory = S3Directory.PROFILE_IMAGE;

        byte[] content = "test image content".getBytes();
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test.jpg",
                "image/jpeg",
                content
        );

        // when
        String fileKey = s3Service.uploadFile(bucket, directory, file);

        // then
        assertThat(fileKey).startsWith("profile-image/");
        assertThat(fileKey).endsWith(".jpg");
        verify(s3Client).putObject(any(PutObjectRequest.class), any(RequestBody.class));
    }

    @Test
    @DisplayName("파일 업로드 실패 - 파일 누락")
    void uploadFile_Failure_FileMissing() {
        // given
        String bucket = "test-bucket";
        S3Directory directory = S3Directory.PROFILE_IMAGE;
        MultipartFile file = null;

        // when & then
        assertThatThrownBy(() -> s3Service.uploadFile(bucket, directory, file))
                .isInstanceOf(BadRequestException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.FILE_MISSING.getCode());
    }

    @Test
    @DisplayName("파일 업로드 실패 - 파일 크기 초과")
    void uploadFile_Failure_FileSizeExceeded() throws IOException {
        // given
        String bucket = "test-bucket";
        S3Directory directory = S3Directory.PROFILE_IMAGE;

        byte[] content = new byte[6 * 1024 * 1024]; // 6MB
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test.jpg",
                "image/jpeg",
                content
        );

        // when & then
        assertThatThrownBy(() -> s3Service.uploadFile(bucket, directory, file))
                .isInstanceOf(BadRequestException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.FILE_SIZE_EXCEEDED.getCode());
    }

    @Test
    @DisplayName("파일 업로드 실패 - 잘못된 확장자")
    void uploadFile_Failure_InvalidExtension() throws IOException {
        // given
        String bucket = "test-bucket";
        S3Directory directory = S3Directory.PROFILE_IMAGE;

        byte[] content = "test image content".getBytes();
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test.txt",
                "text/plain",
                content
        );

        // when & then
        assertThatThrownBy(() -> s3Service.uploadFile(bucket, directory, file))
                .isInstanceOf(BadRequestException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.INVALID_EXTENSION.getCode());
    }

    @Test
    @DisplayName("파일 업로드 실패 - S3 업로드 실패")
    void uploadFile_Failure_S3UploadFailed() throws IOException {
        // given
        String bucket = "test-bucket";
        S3Directory directory = S3Directory.PROFILE_IMAGE;

        byte[] content = "test image content".getBytes();
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test.jpg",
                "image/jpeg",
                content
        );

        doThrow(new RuntimeException("S3 upload failed"))
                .when(s3Client).putObject(any(PutObjectRequest.class), any(RequestBody.class));

        // when & then
        assertThatThrownBy(() -> s3Service.uploadFile(bucket, directory, file))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Failed to upload file to S3");
    }
} 