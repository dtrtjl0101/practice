package qwerty.chaekit.service.util;

import org.springframework.stereotype.Service;
import qwerty.chaekit.dto.upload.UploadUrlResponse;
import qwerty.chaekit.global.enums.S3Directory;
import qwerty.chaekit.global.properties.AwsProperties;

@Service
public class UploadService {
    private final S3Service s3Service;

    private final String ebookBucket;
    private final String imageBucket;

    UploadService(S3Service s3Service, AwsProperties awsProperties) {
        this.s3Service = s3Service;
        this.ebookBucket = awsProperties.ebookBucketName();
        this.imageBucket = awsProperties.imageBucketName();
    }

    public UploadUrlResponse getUrlForEbookUpload(String extension, long size) {
        return s3Service.getUploadUrl(ebookBucket, S3Directory.EBOOK, extension, size);
    }

    public UploadUrlResponse getUrlForEbookCoverImageUpload(String extension, long size) {
        return s3Service.getUploadUrl(imageBucket, S3Directory.EBOOK_COVER_IMAGE, extension, size);
    }

    public UploadUrlResponse getUrlForProfileImageUpload(String extension, long size) {
        return s3Service.getUploadUrl(imageBucket, S3Directory.PROFILE_IMAGE, extension, size);
    }

    public UploadUrlResponse getUrlForGroupImageUpload(String extension, long size) {
        return s3Service.getUploadUrl(imageBucket, S3Directory.GROUP_IMAGE, extension, size);
    }
}
