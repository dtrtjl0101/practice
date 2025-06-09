package qwerty.chaekit.service.notification;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import qwerty.chaekit.domain.member.publisher.PublisherProfile;
import qwerty.chaekit.domain.member.publisher.PublisherProfileRepository;
import qwerty.chaekit.domain.member.user.UserProfile;
import qwerty.chaekit.domain.notification.entity.Notification;
import qwerty.chaekit.domain.notification.repository.NotificationJpaRepository;
import qwerty.chaekit.dto.notification.NotificationResponse;
import qwerty.chaekit.dto.page.PageResponse;
import qwerty.chaekit.global.enums.ErrorCode;
import qwerty.chaekit.global.exception.ForbiddenException;
import qwerty.chaekit.global.exception.NotFoundException;
import qwerty.chaekit.global.security.resolver.PublisherToken;
import qwerty.chaekit.global.security.resolver.UserToken;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PublisherNotificationServiceTest {

    @InjectMocks
    private PublisherNotificationService publisherNotificationService;

    @Mock
    private NotificationJpaRepository notificationJpaRepository;
    @Mock
    private PublisherProfileRepository publisherProfileRepository;

    @Test
    @DisplayName("알림 목록을 성공적으로 조회한다")
    void getNotificationsSuccess() {
        // given
        PublisherToken token = PublisherToken.of(1L, 1L, "test@example.com");
        Pageable pageable = PageRequest.of(0, 10);
        PublisherProfile publisher = mock(PublisherProfile.class);
        Notification notification = mock(Notification.class);
        Page<Notification> notificationPage = new PageImpl<>(List.of(notification));

        when(publisherProfileRepository.findById(token.publisherId()))
                .thenReturn(Optional.of(publisher));
        when(notificationJpaRepository.findByPublisherOrderByCreatedAtDesc(publisher, pageable))
                .thenReturn(notificationPage);

        // when
        PageResponse<NotificationResponse> result = publisherNotificationService.getNotifications(token, pageable);

        // then
        assertThat(result).isNotNull();
        verify(publisherProfileRepository).findById(token.publisherId());
        verify(notificationJpaRepository).findByPublisherOrderByCreatedAtDesc(publisher, pageable);
    }

    @Test
    @DisplayName("존재하지 않는 퍼블리셔로 알림 목록 조회 시 실패한다")
    void getNotificationsFailWhenPublisherNotFound() {
        // given
        PublisherToken token = PublisherToken.of(1L, 1L, "test@example.com");
        Pageable pageable = PageRequest.of(0, 10);

        when(publisherProfileRepository.findById(token.publisherId()))
                .thenReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> publisherNotificationService.getNotifications(token, pageable))
                .isInstanceOf(NotFoundException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.PUBLISHER_NOT_FOUND.getCode());
    }

    @Test
    @DisplayName("알림을 성공적으로 읽음 처리한다")
    void markAsReadSuccess() {
        // given
        PublisherToken token = PublisherToken.of(1L, 1L, "test@example.com");
        Long notificationId = 1L;
        PublisherProfile publisher = mock(PublisherProfile.class);
        Notification notification = mock(Notification.class);

        when(publisherProfileRepository.findById(token.publisherId()))
                .thenReturn(Optional.of(publisher));
        when(notificationJpaRepository.findById(notificationId))
                .thenReturn(Optional.of(notification));
        when(notification.getPublisher()).thenReturn(publisher);
        when(publisher.getId()).thenReturn(1L);

        // when
        publisherNotificationService.markAsRead(token, notificationId);

        // then
        verify(notification).markAsRead();
    }

    @Test
    @DisplayName("존재하지 않는 알림을 읽음 처리 시 실패한다")
    void markAsReadFailWhenNotificationNotFound() {
        // given
        PublisherToken token = PublisherToken.of(1L, 1L, "test@example.com");
        Long notificationId = 1L;
        PublisherProfile publisher = mock(PublisherProfile.class);

        when(publisherProfileRepository.findById(token.publisherId()))
                .thenReturn(Optional.of(publisher));
        when(notificationJpaRepository.findById(notificationId))
                .thenReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> publisherNotificationService.markAsRead(token, notificationId))
                .isInstanceOf(NotFoundException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.NOTIFICATION_NOT_FOUND.getCode());
    }

    @Test
    @DisplayName("다른 퍼블리셔의 알림을 읽음 처리 시 실패한다")
    void markAsReadFailWhenNotYourNotification() {
        // given
        PublisherToken token = PublisherToken.of(1L, 1L, "test@example.com");
        Long notificationId = 1L;
        PublisherProfile publisher = mock(PublisherProfile.class);
        PublisherProfile otherPublisher = mock(PublisherProfile.class);
        Notification notification = mock(Notification.class);

        when(publisherProfileRepository.findById(token.publisherId()))
                .thenReturn(Optional.of(publisher));
        when(notificationJpaRepository.findById(notificationId))
                .thenReturn(Optional.of(notification));
        when(notification.getPublisher()).thenReturn(otherPublisher);
        when(publisher.getId()).thenReturn(1L);
        when(otherPublisher.getId()).thenReturn(2L);

        // when & then
        assertThatThrownBy(() -> publisherNotificationService.markAsRead(token, notificationId))
                .isInstanceOf(ForbiddenException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.NOTIFICATION_NOT_YOURS.getCode());
    }
}
