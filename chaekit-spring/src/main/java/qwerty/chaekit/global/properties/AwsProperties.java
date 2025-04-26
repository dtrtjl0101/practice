package qwerty.chaekit.global.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "aws")
public record AwsProperties(
        String accessKeyId,
        String secretAccessKey,
        String ebookBucketName,
        String imageBucketName,
        Long ebookMaxFileSize,
        String s3Region,
        Long presignedUrlExpirationTime
) {}