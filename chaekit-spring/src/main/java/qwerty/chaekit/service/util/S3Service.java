package qwerty.chaekit.service.util;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import qwerty.chaekit.global.enums.S3Directory;
import qwerty.chaekit.global.properties.AwsProperties;
import qwerty.chaekit.service.util.exceptions.FileInvalidExtensionException;
import qwerty.chaekit.service.util.exceptions.FileMissingException;
import qwerty.chaekit.service.util.exceptions.FileSizeExceededException;
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
    public String convertToPublicImageUrl(String fileKey) {
        return "https://" + imageBucket + ".s3.amazonaws.com/" + fileKey;
    }

    // Upload
    public String uploadFile(String bucket, S3Directory directory, MultipartFile file) {
        String fileKey = getFileKeyWithValidation(directory, file);
        try (InputStream inputStream = file.getInputStream()) {
            s3Client.putObject(
                    PutObjectRequest.builder()
                            .bucket(bucket)
                            .key(fileKey)
                            .build(),
                    RequestBody.fromInputStream(inputStream, file.getSize()));
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        return fileKey;
    }

    private String getFileKeyWithValidation(S3Directory directory, MultipartFile file) {
        if (file == null || file.getOriginalFilename() == null) {
            throw new FileMissingException();
        }
        if (file.getSize() > directory.getMaxSize()) {
            throw new FileSizeExceededException();
        }
        String fileName = file.getOriginalFilename();
        String extension = fileName.substring(fileName.lastIndexOf("."));
        if (!directory.getAllowedExtensions().contains(extension)) {
            throw new FileInvalidExtensionException();
        }
        return directory.getPath() + UUID.randomUUID() + extension;
    }
}
