package qwerty.chaekit.service.util;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import qwerty.chaekit.global.enums.ErrorCode;
import qwerty.chaekit.global.enums.S3Directory;
import qwerty.chaekit.global.exception.BadRequestException;
import qwerty.chaekit.global.properties.AwsProperties;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;

import java.io.IOException;
import java.io.InputStream;
import java.time.Duration;
import java.util.UUID;

@Service
public class S3Service {
    private final S3Presigner s3Presigner;
    private final S3Client s3Client;
    private final Long expirationTime;
    private final String imageBucket;

    public S3Service(S3Presigner s3Presigner, S3Client s3Client, AwsProperties awsProperties) {
        this.s3Presigner = s3Presigner;
        this.s3Client = s3Client;
        this.expirationTime = awsProperties.presignedUrlExpirationTime();
        this.imageBucket = awsProperties.imageBucketName();
    }

    // Download URL
    public String getDownloadUrl(String bucket, S3Directory s3Directory, String fileName) {
        String fileKey = s3Directory.getPath() + fileName;
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

    // Public URL
    public String convertToPublicImageURL(String fileKey) {
        if (fileKey == null) {
            return null;
        }
        return "https://" + imageBucket + ".s3.amazonaws.com/" + fileKey;
    }

    // Upload
    public String uploadFile(String bucket, S3Directory directory, MultipartFile file, boolean required) {
        try {
            return uploadFile(bucket, directory, file);
        } catch (BadRequestException e) {
            if (ErrorCode.FILE_MISSING.getCode().equals(e.getErrorCode()) && !required) {
                return null; // 파일이 필수가 아니면 null 반환
            }
            throw e; // 다른 경우 예외 재발생
        }
    }

    public String uploadFile(String bucket, S3Directory directory, MultipartFile file) {
        String fileKey = validateAndGenerateFileKey(directory, file);
        uploadToS3(bucket, fileKey, file);
        return fileKey;
    }

    private void uploadToS3(String bucket, String fileKey, MultipartFile file) {
        try (InputStream inputStream = file.getInputStream()) {
            s3Client.putObject(
                    PutObjectRequest.builder()
                            .bucket(bucket)
                            .key(fileKey)
                            .build(),
                    RequestBody.fromInputStream(inputStream, file.getSize()));
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload file to S3", e);
        }
    }

    private String validateAndGenerateFileKey(S3Directory directory, MultipartFile file) {
        if (file == null || file.getOriginalFilename() == null) {
            throw new BadRequestException(ErrorCode.FILE_MISSING);
        }
        if (file.getSize() > directory.getMaxSize()) {
            throw new BadRequestException(ErrorCode.FILE_SIZE_EXCEEDED);
        }
        String fileName = file.getOriginalFilename();
        String extension = fileName.substring(fileName.lastIndexOf("."));
        if (!directory.getAllowedExtensions().contains(extension)) {
            throw new BadRequestException(ErrorCode.INVALID_EXTENSION);
        }
        return directory.getPath() + UUID.randomUUID() + extension;
    }
}
