package qwerty.chaekit.service.notification;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import qwerty.chaekit.domain.member.publisher.PublisherProfile;
import qwerty.chaekit.domain.member.publisher.PublisherProfileRepository;
import qwerty.chaekit.domain.notification.entity.Notification;
import qwerty.chaekit.dto.notification.NotificationResponse;
import qwerty.chaekit.dto.page.PageResponse;
import qwerty.chaekit.global.enums.ErrorCode;
import qwerty.chaekit.global.exception.ForbiddenException;
import qwerty.chaekit.global.exception.NotFoundException;
import qwerty.chaekit.global.security.resolver.PublisherToken;
import qwerty.chaekit.domain.notification.repository.NotificationJpaRepository;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PublisherNotificationService {
    private final NotificationJpaRepository notificationJpaRepository;
    private final PublisherProfileRepository publisherProfileRepository;

    public PageResponse<NotificationResponse> getNotifications(PublisherToken token, Pageable pageable) {
        PublisherProfile publisher = publisherProfileRepository.findById(token.publisherId())
                .orElseThrow(() -> new NotFoundException(ErrorCode.PUBLISHER_NOT_FOUND));

        Page<Notification> notifications = notificationJpaRepository.findByPublisherOrderByCreatedAtDesc(publisher, pageable);
        Page<NotificationResponse> responsePage = notifications.map(NotificationResponse::of);
        
        return PageResponse.of(responsePage);
    }

    @Transactional
    public void markAsRead(PublisherToken token, Long notificationId) {
        PublisherProfile publisher = publisherProfileRepository.findById(token.publisherId())
                .orElseThrow(() -> new NotFoundException(ErrorCode.PUBLISHER_NOT_FOUND));

        Notification notification = notificationJpaRepository.findById(notificationId)
                .orElseThrow(() -> new NotFoundException(ErrorCode.NOTIFICATION_NOT_FOUND));

        if (!notification.getPublisher().getId().equals(publisher.getId())) {
            throw new ForbiddenException(ErrorCode.NOTIFICATION_NOT_YOURS);
        }

        notification.markAsRead();
    }
} 