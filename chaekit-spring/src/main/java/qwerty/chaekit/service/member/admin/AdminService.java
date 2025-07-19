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
import qwerty.chaekit.service.util.EmailNotificationService;
import qwerty.chaekit.service.notification.NotificationService;
import qwerty.chaekit.service.util.FileService;

@Service
@Transactional
@RequiredArgsConstructor
public class AdminService {
    //private final PublisherProfileRepository publisherRepository;
    private final EmailNotificationService emailNotificationService;
    private final FileService fileService;
    private final UserProfileRepository userRepository;
    private final NotificationService notificationService;

//    @Getter
//    @Setter
//    private Long adminPublisherId;

    @Getter
    @Setter
    private Long adminUserId;

//    @Transactional(readOnly = true)
//    public PageResponse<PublisherInfoResponse> getPublishers(Pageable pageable) {
//        Pageable pageableWithSort = getPageableOrderedByCreatedAt(pageable);
//        Page<PublisherProfile> page = publisherRepository.findAll(pageableWithSort);
//        return PageResponse.of(page.map(publisher -> PublisherInfoResponse.of(
//                publisher,
//                fileService.convertToPublicImageURL(publisher.getProfileImageKey())
//        )));
//    }

    @Transactional(readOnly = true)
    public PageResponse<UserInfoResponse> getUsers(Pageable pageable) {
        Pageable pageableWithSort = getPageableOrderedByCreatedAt(pageable);
        Page<UserProfile> page = userRepository.findAll(pageableWithSort);
        return PageResponse.of(page.map(user -> UserInfoResponse.of(
                user,
                fileService.convertToPublicImageURL(user.getProfileImageKey()),
                null, // 최근 활동 ID는 여기서 처리하지 않음
                null, // 최근 활동 책 이미지 URL은 여기서 처리하지 않음
                null,
                null
        )));
    }

//    @Transactional(readOnly = true)
//    public PageResponse<PublisherInfoResponse> getPendingPublishers(Pageable pageable) {
//        Pageable pageableWithSort = getPageableOrderedByCreatedAt(pageable);
//        Page<PublisherProfile> page = publisherRepository.findByApprovalStatus(
//                PublisherApprovalStatus.PENDING,
//                pageableWithSort
//        );
//        return PageResponse.of(page.map(publisher -> PublisherInfoResponse.of(
//                        publisher,
//                fileService.convertToPublicImageURL(publisher.getProfileImageKey())
//                )));
//    }

//    @Transactional
//    public void acceptPublisher(Long publisherId) {
//        PublisherProfile publisher = publisherRepository.findByIdWithMember(publisherId)
//                .orElseThrow(() -> new NotFoundException(ErrorCode.PUBLISHER_NOT_FOUND));
//        UserProfile admin = userRepository.findById(adminUserId).orElseThrow(
//                () -> new IllegalStateException("관리자 회원정보가 존재하지 않습니다")
//        );
//
//        // 이미 승인된 경우
//        if (isPublisherApproved(publisher)) {
//            throw new BadRequestException(ErrorCode.PUBLISHER_ALREADY_ACCEPTED);
//        }
//
//        // 승인 처리
//        publisher.approvePublisher();
//
//        notificationService.createPublisherApprovedNotification(publisher, admin);
//        emailNotificationService.sendPublisherApprovalEmail(publisher.getMember().getEmail());
//    }

//    @Transactional
//    public void rejectPublisher(Long publisherId, RejectPublisherRequest request) {
//        PublisherProfile publisher = publisherRepository.findByIdWithMember(publisherId)
//                .orElseThrow(() -> new NotFoundException(ErrorCode.PUBLISHER_NOT_FOUND));
//
//        // 이미 승인된 경우
//        if (isPublisherApproved(publisher)) {
//            throw new BadRequestException(ErrorCode.PUBLISHER_ALREADY_ACCEPTED);
//        }
//
//        // 거절 처리
//        publisher.rejectPublisher();
//
//        UserProfile admin = userRepository.findById(adminUserId)
//                .orElseThrow(() -> new NotFoundException(ErrorCode.USER_NOT_FOUND));
//
//        emailNotificationService.sendPublisherRejectionEmail(publisher.getMember().getEmail(), request.reason());
//    }

    private static Pageable getPageableOrderedByCreatedAt(Pageable pageable) {
        return PageRequest.of(
                pageable.getPageNumber(),
                pageable.getPageSize(),
                pageable.getSort().isEmpty() ? Sort.by(Sort.Order.desc("createdAt")) : pageable.getSort()
        );
    }

//    private boolean isPublisherApproved(PublisherProfile publisher) {
//        return publisher.getApprovalStatus().equals(PublisherApprovalStatus.APPROVED);
//    }
}
