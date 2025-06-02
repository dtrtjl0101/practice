package qwerty.chaekit.service.ebook;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import qwerty.chaekit.domain.ebook.Ebook;
import qwerty.chaekit.domain.ebook.repository.EbookRepository;
import qwerty.chaekit.domain.ebook.request.EbookRequest;
import qwerty.chaekit.domain.ebook.request.EbookRequestRepository;
import qwerty.chaekit.domain.ebook.request.EbookRequestStatus;
import qwerty.chaekit.domain.member.publisher.PublisherProfile;
import qwerty.chaekit.domain.member.user.UserProfile;
import qwerty.chaekit.dto.ebook.request.EbookRequestFetchResponse;
import qwerty.chaekit.dto.ebook.request.EbookRequestRejectRequest;
import qwerty.chaekit.dto.ebook.upload.EbookDownloadResponse;
import qwerty.chaekit.dto.ebook.upload.EbookPostRequest;
import qwerty.chaekit.dto.ebook.upload.EbookPostResponse;
import qwerty.chaekit.dto.page.PageResponse;
import qwerty.chaekit.global.enums.ErrorCode;
import qwerty.chaekit.global.exception.BadRequestException;
import qwerty.chaekit.global.exception.ForbiddenException;
import qwerty.chaekit.global.security.resolver.PublisherToken;
import qwerty.chaekit.global.security.resolver.UserToken;
import qwerty.chaekit.mapper.EbookRequestMapper;
import qwerty.chaekit.service.util.EmailNotificationService;
import qwerty.chaekit.service.util.EntityFinder;
import qwerty.chaekit.service.util.FileService;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class EbookFileService {
    private final EbookRepository ebookRepository;
    private final EbookPolicy ebookPolicy;
    private final FileService fileService;
    private final EntityFinder entityFinder;
    private final EbookRequestRepository ebookRequestRepository;
    private final EbookRequestMapper ebookRequestMapper;
    private final EmailNotificationService emailNotificationService;

    @Transactional
    public EbookPostResponse uploadEbook(PublisherToken publisherToken, EbookPostRequest request) {
        PublisherProfile publisher = entityFinder.findPublisher(publisherToken.publisherId());

        if(!publisher.isApproved()) {
            throw new ForbiddenException(ErrorCode.PUBLISHER_NOT_APPROVED);
        }

        String fileKey = fileService.uploadEbook(request.file());
        String coverImageKey = fileService.uploadEbookCoverImageIfPresent(request.coverImageFile());
        String coverImageURL = fileService.convertToPublicImageURL(coverImageKey);

        EbookRequest ebookRequest = EbookRequest.builder()
                .title(request.title())
                .author(request.author())
                .description(request.description())
                .size(request.file().getSize())
                .price(request.price())
                .fileKey(fileKey)
                .coverImageKey(coverImageKey)
                .publisher(publisher)
                .build();
        EbookRequest saved = ebookRequestRepository.save(ebookRequest);

        if (publisher.isAdmin()) {
            approveRequest(saved);
        }

        return EbookPostResponse.of(saved.toEbook(), ebookRequest.getId(), coverImageURL);
    }

    @Transactional
    public EbookDownloadResponse getPresignedEbookUrlForUser(UserToken userToken, Long ebookId) {
        UserProfile user = entityFinder.findUser(userToken.userId());
        Ebook ebook = entityFinder.findEbook(ebookId);

        ebookPolicy.assertEBookPurchased(user, ebook);
        
        String ebookFileKey = ebook.getFileKey();
        String downloadUrl = fileService.getEbookDownloadUrl(ebookFileKey);

        return EbookDownloadResponse.of(downloadUrl);
    }
    
    @Transactional
    public EbookDownloadResponse getPresignedEbookUrlForPublisher(PublisherToken publisherToken, Long ebookId) {
        PublisherProfile publisher = entityFinder.findPublisher(publisherToken.publisherId());
        Ebook ebook = entityFinder.findEbook(ebookId);

        if (!ebook.isOwnedBy(publisher)) {
            throw new ForbiddenException(ErrorCode.EBOOK_NOT_OWNED);
        }

        String ebookFileKey = ebook.getFileKey();
        String downloadUrl = fileService.getEbookDownloadUrl(ebookFileKey);

        return EbookDownloadResponse.of(downloadUrl);
    }
    
    @Transactional
    public EbookDownloadResponse getPresignedTempEbookUrlForPublisher(PublisherToken publisherToken, Long ebookRequestId) {
        PublisherProfile publisher = entityFinder.findPublisher(publisherToken.publisherId());
        EbookRequest ebookRequest = entityFinder.findEbookRequest(ebookRequestId);

        if (!ebookRequest.isRequestedBy(publisher) && publisher.isNotAdmin()) {
            throw new ForbiddenException(ErrorCode.EBOOK_REQUEST_NOT_YOURS);
        }

        String ebookFileKey = ebookRequest.getFileKey();
        String downloadUrl = fileService.getEbookDownloadUrl(ebookFileKey);

        return EbookDownloadResponse.of(downloadUrl);
    }
    
    @Transactional
    public void approveEbookByAdmin(PublisherToken publisherToken, Long requestId) {
        PublisherProfile publisher = entityFinder.findPublisher(publisherToken.publisherId());
        EbookRequest request = entityFinder.findEbookRequest(requestId);
        
        assertAdmin(publisher);
        assertRequestIsPending(request);

        approveRequest(request);
    }

    @Transactional
    public void rejectEbookByAdmin(PublisherToken publisherToken, Long requestId, EbookRequestRejectRequest requestBody) {
        PublisherProfile publisher = entityFinder.findPublisher(publisherToken.publisherId());
        EbookRequest request = entityFinder.findEbookRequest(requestId);
        
        assertAdmin(publisher);
        assertRequestIsPending(request);
        
        request.reject(requestBody.reason());
        emailNotificationService.sendEbookRejectionEmail(publisher.getMember().getEmail(), requestBody.reason());
    }

    @Transactional(readOnly = true)
    public PageResponse<EbookRequestFetchResponse> getEbookRequests(
            PublisherToken publisherToken, Pageable pageable
    ) {
        PublisherProfile publisher = entityFinder.findPublisher(publisherToken.publisherId());
        
        if (publisher.isNotAdmin()) {
            return PageResponse.of(
                    ebookRequestRepository.findByPublisher(publisher, pageable)
                            .map(ebookRequestMapper::toFetchResponse)
            );
        }

        return PageResponse.of(
                ebookRequestRepository.findByStatusIn(
                        List.of(
                                EbookRequestStatus.PENDING, 
                                EbookRequestStatus.REJECTED
                        ), pageable
                        ).map(ebookRequestMapper::toFetchResponse)
        );
    }

    private void assertAdmin(PublisherProfile publisher) {
        if (publisher.isNotAdmin()) {
            throw new ForbiddenException(ErrorCode.ONLY_ADMIN);
        }
    }

    private void assertRequestIsPending(EbookRequest request) {
        if (request.isNotPending()) {
            throw new BadRequestException(ErrorCode.EBOOK_REQUEST_NOT_PENDING);
        }
    }

    private void approveRequest(EbookRequest request) {
        Ebook savedEbook = ebookRepository.save(request.toEbook());
        request.approve(savedEbook);
    }
}

