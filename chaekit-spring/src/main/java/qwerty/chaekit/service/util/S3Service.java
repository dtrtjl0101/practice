package qwerty.chaekit.service.util;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import qwerty.chaekit.global.enums.ErrorCode;
import qwerty.chaekit.global.enums.S3Directory;
import qwerty.chaekit.global.exception.BadRequestException;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;

import java.io.InputStream;
import java.time.Duration;
import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class S3Service {
    private final S3Presigner s3Presigner;
    private final S3Client s3Client;

    // Download URL
    public String getPresignedDownloadUrl(String bucket, String fileKey, Long expirationTime) {
        GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                .bucket(bucket)
                .key(fileKey)
                .build();

        PresignedGetObjectRequest presignedRequest = s3Presigner.presignGetObject(builder -> builder
                .getObjectRequest(getObjectRequest)
                .signatureDuration(Duration.ofSeconds(expirationTime))
        );
        return presignedRequest.url().toString();
    }

    // Upload
    public boolean isFileMissing(MultipartFile file) {
        return file == null
                || file.isEmpty()
                || file.getOriginalFilename() == null
                || file.getOriginalFilename().isBlank();
    }

    public String uploadFile(String bucket, S3Directory directory, MultipartFile file) {
        if (isFileMissing(file)) {
            throw new BadRequestException(ErrorCode.FILE_MISSING);
        }
        String fileName = file.getOriginalFilename();
        String extension = Objects.requireNonNull(fileName).substring(fileName.lastIndexOf("."));

        assertByS3DirectoryRule(directory, file, extension);

        String fileKey = directory.getPath() + UUID.randomUUID() + extension;
        uploadToS3(bucket, fileKey, file);
        return fileKey;
    }

    private static void assertByS3DirectoryRule(S3Directory directory, MultipartFile file, String extension) {
        if (file.getSize() > directory.getMaxSize()) {
            throw new BadRequestException(ErrorCode.FILE_SIZE_EXCEEDED);
        }
        if (!directory.getAllowedExtensions().contains(extension)) {
            throw new BadRequestException(ErrorCode.INVALID_EXTENSION);
        }
    }

    private void uploadToS3(String bucket, String fileKey, MultipartFile file) {
        try (InputStream inputStream = file.getInputStream()) {
            s3Client.putObject(
                    PutObjectRequest.builder()
                            .bucket(bucket)
                            .key(fileKey)
                            .build(),
                    RequestBody.fromInputStream(inputStream, file.getSize()));
        } catch (Exception e) {
            throw new RuntimeException("Failed to upload file to S3", e);
        }
    }
}
