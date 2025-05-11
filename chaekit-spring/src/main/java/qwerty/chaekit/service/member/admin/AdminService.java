package qwerty.chaekit.service.member.admin;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import qwerty.chaekit.domain.member.publisher.PublisherProfile;
import qwerty.chaekit.domain.member.publisher.PublisherProfileRepository;
import qwerty.chaekit.domain.member.publisher.enums.PublisherApprovalStatus;
import qwerty.chaekit.domain.member.user.UserProfile;
import qwerty.chaekit.domain.member.user.UserProfileRepository;
import qwerty.chaekit.dto.member.PublisherInfoResponse;
import qwerty.chaekit.dto.member.UserInfoResponse;
import qwerty.chaekit.dto.member.admin.RejectPublisherRequest;
import qwerty.chaekit.dto.page.PageResponse;
import qwerty.chaekit.global.enums.ErrorCode;
import qwerty.chaekit.global.exception.BadRequestException;
import qwerty.chaekit.global.exception.NotFoundException;
import qwerty.chaekit.service.member.notification.EmailService;
import qwerty.chaekit.service.util.S3Service;
import qwerty.chaekit.service.notification.NotificationService;

@Service
@RequiredArgsConstructor
public class AdminService {
    private final PublisherProfileRepository publisherRepository;
    private final EmailService emailService;
    private final S3Service s3Service;
    private final UserProfileRepository userRepository;
    private final NotificationService notificationService;

    @Getter
    @Setter
    private Long adminPublisherId;

    @Getter
    @Setter
    private Long adminUserId;

    @Transactional(readOnly = true)
    public PageResponse<PublisherInfoResponse> getPublishers(Pageable pageable) {
        Pageable pageableWithSort = getPageableOrderedByCreatedAt(pageable);
        Page<PublisherProfile> page = publisherRepository.findAll(pageableWithSort);
        return PageResponse.of(page.map(publisher -> PublisherInfoResponse.of(
                publisher,
                s3Service.convertToPublicImageURL(publisher.getProfileImageKey())
        )));
    }

    @Transactional(readOnly = true)
    public PageResponse<UserInfoResponse> getUsers(Pageable pageable) {
        Pageable pageableWithSort = getPageableOrderedByCreatedAt(pageable);
        Page<UserProfile> page = userRepository.findAll(pageableWithSort);
        return PageResponse.of(page.map(user -> UserInfoResponse.of(
                user,
                s3Service.convertToPublicImageURL(user.getProfileImageKey())
        )));
    }

    @Transactional(readOnly = true)
    public PageResponse<PublisherInfoResponse> getPendingPublishers(Pageable pageable) {
        Pageable pageableWithSort = getPageableOrderedByCreatedAt(pageable);
        Page<PublisherProfile> page = publisherRepository.findByApprovalStatus(
                PublisherApprovalStatus.PENDING,
                pageableWithSort
        );
        return PageResponse.of(page.map(publisher -> PublisherInfoResponse.of(
                        publisher,
                        s3Service.convertToPublicImageURL(publisher.getProfileImageKey())
                )));
    }

    @Transactional
    public void acceptPublisher(Long publisherId) {
        PublisherProfile publisher = publisherRepository.findByIdWithMember(publisherId)
                .orElseThrow(() -> new NotFoundException(ErrorCode.PUBLISHER_NOT_FOUND));

        // 이미 승인된 경우
        if (isPublisherApproved(publisher)) {
            throw new BadRequestException(ErrorCode.PUBLISHER_ALREADY_ACCEPTED);
        }

        // 승인 처리
        publisher.approvePublisher();
        emailService.sendPublisherApprovalEmail(publisher.getMember().getEmail());

        UserProfile adminProfile = userRepository.findById(adminUserId)
                .orElseThrow(() -> new NotFoundException(ErrorCode.USER_NOT_FOUND));
        UserProfile publisherProfile = userRepository.findByMember_Id(publisher.getMember().getId())
                .orElseThrow(() -> new NotFoundException(ErrorCode.USER_NOT_FOUND));
        notificationService.createPublisherApprovedNotification(publisherProfile, adminProfile);
    }

    @Transactional
    public void rejectPublisher(Long publisherId, RejectPublisherRequest request) {
        PublisherProfile publisher = publisherRepository.findByIdWithMember(publisherId)
                .orElseThrow(() -> new NotFoundException(ErrorCode.PUBLISHER_NOT_FOUND));

        // 이미 승인된 경우
        if (isPublisherApproved(publisher)) {
            throw new BadRequestException(ErrorCode.PUBLISHER_ALREADY_ACCEPTED);
        }

        // 거절 처리
        publisher.rejectPublisher();
        emailService.sendPublisherRejectionEmail(publisher.getMember().getEmail(), request.reason());

        UserProfile adminProfile = userRepository.findById(adminUserId)
                .orElseThrow(() -> new NotFoundException(ErrorCode.USER_NOT_FOUND));
        UserProfile publisherProfile = userRepository.findByMember_Id(publisher.getMember().getId())
                .orElseThrow(() -> new NotFoundException(ErrorCode.USER_NOT_FOUND));
        notificationService.createPublisherRejectedNotification(publisherProfile, adminProfile);
    }

    private static Pageable getPageableOrderedByCreatedAt(Pageable pageable) {
        return PageRequest.of(
                pageable.getPageNumber(),
                pageable.getPageSize(),
                pageable.getSort().isEmpty() ? Sort.by(Sort.Order.desc("createdAt")) : pageable.getSort()
        );
    }

    private boolean isPublisherApproved(PublisherProfile publisher) {
        return publisher.getApprovalStatus().equals(PublisherApprovalStatus.APPROVED);
    }
}
