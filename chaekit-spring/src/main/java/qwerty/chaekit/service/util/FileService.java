package qwerty.chaekit.service.util;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import qwerty.chaekit.global.enums.S3Directory;
import qwerty.chaekit.global.properties.AwsProperties;

@Service
@RequiredArgsConstructor
public class FileService {
    private final S3Service s3Service;
    private final AwsProperties awsProperties;

    // convert
    public String convertToPublicImageURL(String fileKey) {
        if(fileKey == null || fileKey.isEmpty()) {
            return null;
        }
        
        if (fileKey.startsWith("oauth2-profile-image/")) {
            return fileKey.substring("oauth2-profile-image/".length());
        }
        return "https://" + awsProperties.imageBucketName() + ".s3.amazonaws.com/" + fileKey;
    }

    // download
    public String getEbookDownloadUrl(String fileKey) {
        return s3Service.getPresignedDownloadUrl(awsProperties.ebookBucketName(), fileKey, awsProperties.presignedUrlExpirationTime());
    }

    // upload
    public String uploadProfileImageIfPresent(MultipartFile file) {
        return uploadIfPresent(awsProperties.imageBucketName(), S3Directory.PROFILE_IMAGE, file);
    }

    public String uploadGroupImageIfPresent(MultipartFile file) {
        return uploadIfPresent(awsProperties.imageBucketName(), S3Directory.GROUP_IMAGE, file);
    }

    public String uploadEbookCoverImageIfPresent(MultipartFile file) {
        return uploadIfPresent(awsProperties.imageBucketName(), S3Directory.EBOOK_COVER_IMAGE, file);
    }

    public String uploadEbook(MultipartFile file) {
        return s3Service.uploadFile(awsProperties.ebookBucketName(), S3Directory.EBOOK, file);
    }

    public String uploadIfPresent(String bucket, S3Directory s3Directory, MultipartFile file) {
        if (s3Service.isFileMissing(file)) {
           return null;
        }
        return s3Service.uploadFile(bucket, s3Directory, file);
    }

}
