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
import qwerty.chaekit.service.util.EntityFinder;
import qwerty.chaekit.service.util.FileService;

@Service
@RequiredArgsConstructor
public class EbookFileService {
    private final EbookRepository ebookRepository;
    private final EbookPolicy ebookPolicy;
    private final FileService fileService;
    private final EntityFinder entityFinder;
    private final EbookRequestRepository ebookRequestRepository;
    private final EbookRequestMapper ebookRequestMapper;

    @Transactional
    public EbookPostResponse uploadEbook(PublisherToken publisherToken, EbookPostRequest request) {
        PublisherProfile publisher = entityFinder.findPublisher(publisherToken.publisherId());

        if(!publisher.isApproved()) {
            throw new ForbiddenException(ErrorCode.PUBLISHER_NOT_APPROVED);
        }

        String fileKey = fileService.uploadEbook(request.file());
        String coverImageKey = fileService.uploadEbookCoverImageIfPresent(request.coverImageFile());
        String coverImageURL = fileService.convertToPublicImageURL(coverImageKey);

        EbookRequest ebook = EbookRequest.builder()
                .title(request.title())
                .author(request.author())
                .description(request.description())
                .size(request.file().getSize())
                .price(request.price())
                .fileKey(fileKey)
                .coverImageKey(coverImageKey)
                .publisher(publisher)
                .build();
        EbookRequest saved = ebookRequestRepository.save(ebook);

        if (publisher.isNotAdmin()) {
            approveRequest(saved);
        }

        return EbookPostResponse.of(saved.toEbook(), coverImageURL);
    }

    @Transactional
    public EbookDownloadResponse getPresignedEbookUrl(UserToken userToken, Long ebookId) {
        UserProfile user = entityFinder.findUser(userToken.userId());
        Ebook ebook = entityFinder.findEbook(ebookId);

        ebookPolicy.assertEBookPurchased(user, ebook);
        
        String ebookFileKey = ebook.getFileKey();
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
    }

    @Transactional(readOnly = true)
    public PageResponse<EbookRequestFetchResponse> getEbookRequests(
            PublisherToken publisherToken, Pageable pageable
    ) {
        PublisherProfile publisher = entityFinder.findPublisher(publisherToken.publisherId());
        
        if (publisher.isNotAdmin()) {
            return PageResponse.of(
                    ebookRequestRepository.findByPublisherAndStatus(publisher, EbookRequestStatus.PENDING, pageable)
                            .map(ebookRequestMapper::toFetchResponse)
            );
        }

        return PageResponse.of(
                ebookRequestRepository.findByStatus(EbookRequestStatus.PENDING, pageable)
                        .map(ebookRequestMapper::toFetchResponse)
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

