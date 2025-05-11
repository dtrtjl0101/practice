package qwerty.chaekit.service.notification;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import qwerty.chaekit.domain.group.ReadingGroup;
import qwerty.chaekit.domain.member.publisher.PublisherProfile;
import qwerty.chaekit.domain.member.user.UserProfile;
import qwerty.chaekit.domain.member.user.UserProfileRepository;
import qwerty.chaekit.domain.notification.entity.Notification;
import qwerty.chaekit.domain.notification.entity.NotificationType;
import qwerty.chaekit.dto.notification.NotificationResponse;
import qwerty.chaekit.dto.page.PageResponse;
import qwerty.chaekit.global.enums.ErrorCode;
import qwerty.chaekit.global.exception.ForbiddenException;
import qwerty.chaekit.global.exception.NotFoundException;
import qwerty.chaekit.global.security.resolver.UserToken;
import qwerty.chaekit.domain.notification.repository.NotificationJpaRepository;
import qwerty.chaekit.domain.group.activity.discussion.Discussion;
import qwerty.chaekit.domain.group.activity.discussion.DiscussionComment;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NotificationService {
    private final NotificationJpaRepository notificationJpaRepository;
    private final UserProfileRepository userProfileRepository;

    @Transactional
    public void createGroupJoinRequestNotification(UserProfile receiver, UserProfile sender, ReadingGroup group) {
        String message = String.format("%s님이 %s 그룹에 가입을 요청했습니다.", sender.getNickname(), group.getName());
        Notification notification = new Notification(receiver, sender, null,group, NotificationType.GROUP_JOIN_REQUEST, message);
        notificationJpaRepository.save(notification);
    }

    @Transactional
    public void createGroupJoinApprovedNotification(UserProfile receiver, UserProfile sender, ReadingGroup group) {
        String message = String.format("%s 그룹의 가입 요청이 승인되었습니다.", group.getName());
        Notification notification = new Notification(receiver, sender, null,group, NotificationType.GROUP_JOIN_APPROVED, message);
        notificationJpaRepository.save(notification);
    }

    @Transactional
    public void createGroupJoinRejectedNotification(UserProfile receiver, UserProfile sender, ReadingGroup group) {
        String message = String.format("%s 그룹의 가입 요청이 거절되었습니다.", group.getName());
        Notification notification = new Notification(receiver, sender,null, group, NotificationType.GROUP_JOIN_REJECTED, message);
        notificationJpaRepository.save(notification);
    }

    @Transactional
    public void createPublisherJoinRequestNotification(UserProfile admin, PublisherProfile publisher) {
        String message = String.format("%s님이 출판사 가입을 요청했습니다.", publisher.getPublisherName());
        Notification notification = new Notification(null,admin, publisher, null, NotificationType.PUBLISHER_JOIN_REQUEST, message);
        notificationJpaRepository.save(notification);
    }

    @Transactional
    public void createPublisherApprovedNotification(PublisherProfile publisher, UserProfile admin) {
        String message = "출판사 가입이 승인되었습니다.";
        Notification notification = new Notification(admin,null,publisher, null, NotificationType.PUBLISHER_APPROVED, message);
        notificationJpaRepository.save(notification);
    }

    @Transactional
    public void createPublisherRejectedNotification(PublisherProfile publisher, UserProfile admin) {
        String message = String.format("출판사 가입이 거절되었습니다.");
        Notification notification = new Notification(null, admin, publisher,null, NotificationType.PUBLISHER_REJECTED, message);
        notificationJpaRepository.save(notification);
    }

    @Transactional
    public void createDiscussionCommentNotification(UserProfile receiver, UserProfile sender, Discussion discussion) {
        String message = String.format("%s님이 %s 토론에 댓글을 달았습니다.", sender.getNickname(), discussion.getTitle());
        Notification notification = new Notification(receiver, sender, null, null,NotificationType.DISCUSSION_COMMENT, message);
        notificationJpaRepository.save(notification);
    }

    @Transactional
    public void createCommentReplyNotification(UserProfile receiver, UserProfile sender, DiscussionComment comment) {
        String message = String.format("%s님이 내 댓글에 답글을 달았습니다.", sender.getNickname());
        Notification notification = new Notification(receiver, sender, null, null,NotificationType.COMMENT_REPLY, message);
        notificationJpaRepository.save(notification);
    }

    public PageResponse<NotificationResponse> getNotifications(UserToken userToken, Pageable pageable) {
        UserProfile userProfile = userProfileRepository.findById(userToken.userId())
                .orElseThrow(() -> new NotFoundException(ErrorCode.USER_NOT_FOUND));

        Page<Notification> notifications = notificationJpaRepository.findByReceiverOrderByCreatedAtDesc(userProfile, pageable);
        Page<NotificationResponse> responsePage = notifications.map(NotificationResponse::of);
        
        return PageResponse.of(responsePage);
    }

    @Transactional
    public void markAsRead(UserToken userToken, Long notificationId) {
        UserProfile userProfile = userProfileRepository.findById(userToken.userId())
                .orElseThrow(() -> new NotFoundException(ErrorCode.USER_NOT_FOUND));

        Notification notification = notificationJpaRepository.findById(notificationId)
                .orElseThrow(() -> new NotFoundException(ErrorCode.NOTIFICATION_NOT_FOUND));

        if (!notification.getReceiver().getId().equals(userProfile.getId())) {
            throw new ForbiddenException(ErrorCode.NOTIFICATION_NOT_YOURS);
        }

        notification.markAsRead();
    }
} 