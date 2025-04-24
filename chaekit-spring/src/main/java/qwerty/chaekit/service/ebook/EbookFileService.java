package qwerty.chaekit.service.ebook;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import qwerty.chaekit.domain.ebook.Ebook;
import qwerty.chaekit.domain.ebook.EbookRepository;
import qwerty.chaekit.domain.member.publisher.PublisherProfileRepository;
import qwerty.chaekit.dto.ebook.upload.EbookDownloadResponse;
import qwerty.chaekit.dto.ebook.upload.EbookPostRequest;
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
public class EbookFileService {
    private final EbookRepository ebookRepository;
    private final S3Service s3Service;
    private final String ebookBucket;
    private final PublisherProfileRepository publisherRepository;
    private final AdminService adminService;

    public EbookFileService(EbookRepository ebookRepository, S3Service s3Service, AwsProperties awsProperties, PublisherProfileRepository publisherRepository, AdminService adminService) {
        this.ebookRepository = ebookRepository;
        this.publisherRepository = publisherRepository;
        this.s3Service = s3Service;
        this.ebookBucket = awsProperties.ebookBucketName();
        this.adminService = adminService;
    }

    @Transactional
    public String uploadEbook(PublisherToken publisherToken, EbookPostRequest request) {
        String title = request.title();
        String author = request.author();
        String description = request.description();
        MultipartFile file = request.file();

        final String fileKey;
        fileKey = s3Service.uploadFile(ebookBucket, S3Directory.EBOOK, file);

        Ebook ebook = Ebook.builder()
                .title(title)
                .author(author)
                .description(description)
                .size(file.getSize())
                .fileKey(fileKey)
                .publisher(publisherRepository.getReferenceById(publisherToken.publisherId()))
                .build();
        ebookRepository.save(ebook);

        return "File uploaded successfully: " + fileKey;
    }

    @Transactional
    public EbookDownloadResponse getPresignedEbookUrl(UserToken userToken, Long ebookId) {
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

