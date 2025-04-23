package qwerty.chaekit.service.util;

import org.springframework.stereotype.Service;
import qwerty.chaekit.dto.upload.UploadUrlResponse;
import qwerty.chaekit.global.enums.ErrorCode;
import qwerty.chaekit.global.enums.S3Directory;
import qwerty.chaekit.global.exception.BadRequestException;
import qwerty.chaekit.global.properties.AwsProperties;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;

import java.time.Duration;
import java.util.UUID;

@Service
public class S3Service {
    private final S3Presigner s3Presigner;
    private final Long expirationTime;

    public S3Service(S3Presigner s3Presigner, AwsProperties awsProperties) {
        this.s3Presigner = s3Presigner;
        this.expirationTime = awsProperties.presignedUrlExpirationTime();
    }

    // Download URL
    public String getDownloadUrl(String bucket, S3Directory s3Directory, String fileName) {
        String fileKey = s3Directory.getPath() + fileName;
        return generatePresignedUrl(bucket, fileKey, false);
    }

    // Upload URL
    public UploadUrlResponse getUploadUrl(String bucket, S3Directory directory, String extension, long size) {
        if(!directory.getAllowedExtensions().contains(extension)) {
            throw new BadRequestException(ErrorCode.INVALID_EXTENSION);
        }
        if(size > directory.getMaxSize()) {
            throw new BadRequestException(ErrorCode.FILE_SIZE_EXCEEDED);
        }

        String fileKey = generateFileKey(directory, extension);
        String presignedUrl = generatePresignedUrl(bucket, fileKey, true);
        return UploadUrlResponse.of(presignedUrl, fileKey);
    }

    private String generateFileKey(S3Directory directory, String extension) {
        return directory.getPath() + generateUUID() + extension;
    }

    private String generateUUID() {
        return UUID.randomUUID().toString();
    }

    private String generatePresignedUrl(String bucket, String fileKey, boolean isUpload) {
        if (isUpload) {
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucket)
                    .key(fileKey)
                    .build();

            PresignedPutObjectRequest presignedRequest = s3Presigner.presignPutObject(builder -> builder
                    .putObjectRequest(putObjectRequest)
                    .signatureDuration(Duration.ofSeconds(expirationTime))

            );

            return presignedRequest.url().toString();
        } else {
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
    }
}
