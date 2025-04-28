package qwerty.chaekit.service.ebook;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import qwerty.chaekit.domain.ebook.Ebook;
import qwerty.chaekit.domain.ebook.EbookJpaRepository;
import qwerty.chaekit.domain.ebook.EbookRepository;
import qwerty.chaekit.domain.member.publisher.PublisherProfileRepository;
import qwerty.chaekit.dto.ebook.upload.EbookDownloadResponse;
import qwerty.chaekit.dto.ebook.upload.EbookPostRequest;
import qwerty.chaekit.dto.ebook.upload.EbookPostResponse;
import qwerty.chaekit.global.enums.ErrorCode;
import qwerty.chaekit.global.enums.S3Directory;
import qwerty.chaekit.global.exception.BadRequestException;
import qwerty.chaekit.global.exception.NotFoundException;
import qwerty.chaekit.global.properties.AwsProperties;
import qwerty.chaekit.global.security.resolver.PublisherToken;
import qwerty.chaekit.global.security.resolver.UserToken;
import qwerty.chaekit.service.member.admin.AdminService;
import qwerty.chaekit.service.util.S3Service;

@Service
@RequiredArgsConstructor
public class EbookFileService {
    private final EbookRepository ebookRepository;
    private final S3Service s3Service;
    private final AwsProperties awsProperties;
    private final PublisherProfileRepository publisherRepository;
    private final AdminService adminService;


    @Transactional
    public EbookPostResponse uploadEbook(PublisherToken publisherToken, EbookPostRequest request) {
        String ebookBucket = awsProperties.ebookBucketName();
        String imageBucket = awsProperties.imageBucketName();

        String fileKey = s3Service.uploadFile(ebookBucket, S3Directory.EBOOK, request.file());
        String coverImageKey = s3Service.uploadFile(
                imageBucket,
                S3Directory.EBOOK_COVER_IMAGE,
                request.coverImageFile(),
                false
        );
        String coverImageURL = s3Service.convertToPublicImageURL(coverImageKey);

        Ebook ebook = Ebook.builder()
                .title(request.title())
                .author(request.author())
                .description(request.description())
                .size(request.file().getSize())
                .fileKey(fileKey)
                .coverImageKey(coverImageKey)
                .publisher(publisherRepository.getReferenceById(publisherToken.publisherId()))
                .build();
        Ebook saved = ebookRepository.save(ebook);

        return EbookPostResponse.of(saved, coverImageURL);
    }

    @Transactional
    public EbookDownloadResponse getPresignedEbookUrl(UserToken userToken, Long ebookId) {
        String ebookBucket = awsProperties.ebookBucketName();
        // 다운로드할 권한이 있는 경우
        if (!userToken.userId().equals(adminService.getAdminUserId())) {
            throw new BadRequestException(ErrorCode.ONLY_ADMIN);
        }
        Ebook ebook = ebookRepository.findById(ebookId)
                .orElseThrow(() -> new NotFoundException(ErrorCode.EBOOK_NOT_FOUND));

        String fileKey = ebook.getFileKey();
        String downloadUrl = s3Service.getDownloadUrl(ebookBucket, S3Directory.EBOOK, fileKey);

        return EbookDownloadResponse.of(downloadUrl);
    }
}

