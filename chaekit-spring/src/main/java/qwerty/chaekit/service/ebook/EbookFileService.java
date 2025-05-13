package qwerty.chaekit.service.ebook;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import qwerty.chaekit.domain.ebook.Ebook;
import qwerty.chaekit.domain.ebook.purchase.repository.EbookPurchaseRepository;
import qwerty.chaekit.domain.ebook.repository.EbookRepository;
import qwerty.chaekit.domain.member.publisher.PublisherProfile;
import qwerty.chaekit.domain.member.publisher.PublisherProfileRepository;
import qwerty.chaekit.dto.ebook.upload.EbookDownloadResponse;
import qwerty.chaekit.dto.ebook.upload.EbookPostRequest;
import qwerty.chaekit.dto.ebook.upload.EbookPostResponse;
import qwerty.chaekit.global.enums.ErrorCode;
import qwerty.chaekit.global.enums.S3Directory;
import qwerty.chaekit.global.exception.BadRequestException;
import qwerty.chaekit.global.exception.ForbiddenException;
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
    private final EbookPurchaseRepository ebookPurchaseRepository;

    @Transactional
    public EbookPostResponse uploadEbook(PublisherToken publisherToken, EbookPostRequest request) {
        PublisherProfile publisher = publisherRepository.findById(publisherToken.publisherId())
                .orElseThrow(() -> new NotFoundException(ErrorCode.PUBLISHER_NOT_FOUND));
        if(!publisher.isApproved()) {
            throw new ForbiddenException(ErrorCode.PUBLISHER_NOT_APPROVED);
        }

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
                .price(request.price())
                .fileKey(fileKey)
                .coverImageKey(coverImageKey)
                .publisher(publisher)
                .build();
        Ebook saved = ebookRepository.save(ebook);

        return EbookPostResponse.of(saved, coverImageURL);
    }

    @Transactional
    public EbookDownloadResponse getPresignedEbookUrl(UserToken userToken, Long ebookId) {
        String ebookBucket = awsProperties.ebookBucketName();
        Ebook ebook = ebookRepository.findById(ebookId)
                .orElseThrow(() -> new NotFoundException(ErrorCode.EBOOK_NOT_FOUND));

        if (!canReadEbook(userToken, ebookId)) {
            throw new BadRequestException(ErrorCode.EBOOK_NOT_PURCHASED);
        }

        String ebookFileKey = ebook.getFileKey();
        String downloadUrl = s3Service.getPresignedDownloadUrl(ebookBucket, ebookFileKey);

        return EbookDownloadResponse.of(downloadUrl);
    }
    
    private boolean canReadEbook(UserToken userToken, Long ebookId) {
        return ebookPurchaseRepository.existsByUserIdAndEbookId(userToken.userId(), ebookId)
                || userToken.userId().equals(adminService.getAdminUserId());
    }
}

