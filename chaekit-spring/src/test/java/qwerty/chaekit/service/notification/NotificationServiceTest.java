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
import org.springframework.messaging.simp.SimpMessagingTemplate;
import qwerty.chaekit.domain.group.ReadingGroup;
import qwerty.chaekit.domain.group.activity.discussion.Discussion;
import qwerty.chaekit.domain.group.activity.discussion.comment.DiscussionComment;
import qwerty.chaekit.domain.highlight.Highlight;
import qwerty.chaekit.domain.highlight.comment.HighlightComment;
import qwerty.chaekit.domain.member.publisher.PublisherProfile;
import qwerty.chaekit.domain.member.user.UserProfile;
import qwerty.chaekit.domain.member.user.UserProfileRepository;
import qwerty.chaekit.domain.notification.entity.Notification;
import qwerty.chaekit.domain.notification.entity.NotificationType;
import qwerty.chaekit.domain.notification.repository.NotificationJpaRepository;
import qwerty.chaekit.dto.notification.NotificationResponse;
import qwerty.chaekit.dto.page.PageResponse;
import qwerty.chaekit.global.enums.ErrorCode;
import qwerty.chaekit.global.exception.ForbiddenException;
import qwerty.chaekit.global.exception.NotFoundException;
import qwerty.chaekit.global.security.resolver.UserToken;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @InjectMocks
    private NotificationService notificationService;

    @Mock
    private NotificationJpaRepository notificationJpaRepository;

    @Mock
    private UserProfileRepository userProfileRepository;

    @Mock
    private SimpMessagingTemplate simpMessagingTemplate;

    @Test
    @DisplayName("그룹 가입 요청 알림 생성 성공")
    void createGroupJoinRequestNotificationSuccess() {
        // given
        UserProfile receiver = mock(UserProfile.class);
        UserProfile sender = mock(UserProfile.class);
        ReadingGroup group = mock(ReadingGroup.class);

        when(sender.getNickname()).thenReturn("sender");
        when(group.getName()).thenReturn("group");
        when(receiver.getId()).thenReturn(1L);

        // when
        notificationService.createGroupJoinRequestNotification(receiver, sender, group);

        // then
        verify(notificationJpaRepository).save(any(Notification.class));
        verify(simpMessagingTemplate).convertAndSend(eq("/topic/notification/1"), any(NotificationResponse.class));
    }

    @Test
    @DisplayName("알림 목록 조회 성공")
    void getNotificationsSuccess() {
        // given
        Long userId = 1L;
        UserToken userToken = mock(UserToken.class);
        UserProfile user = mock(UserProfile.class);
        Notification notification = mock(Notification.class);
        Pageable pageable = PageRequest.of(0, 20);
        Page<Notification> notificationPage = new PageImpl<>(List.of(notification));

        when(userToken.userId()).thenReturn(userId);
        when(userProfileRepository.findById(userId)).thenReturn(Optional.of(user));
        when(notificationJpaRepository.findByReceiverOrderByCreatedAtDesc(user, pageable)).thenReturn(notificationPage);

        // when
        PageResponse<NotificationResponse> result = notificationService.getNotifications(userToken, pageable);

        // then
        assertThat(result).isNotNull();
        assertThat(result.content()).hasSize(1);
        verify(userProfileRepository).findById(userId);
        verify(notificationJpaRepository).findByReceiverOrderByCreatedAtDesc(user, pageable);
    }

    @Test
    @DisplayName("알림 목록 조회 실패 - 사용자를 찾을 수 없음")
    void getNotificationsFail_UserNotFound() {
        // given
        Long userId = 1L;
        UserToken userToken = mock(UserToken.class);
        Pageable pageable = PageRequest.of(0, 20);

        when(userToken.userId()).thenReturn(userId);
        when(userProfileRepository.findById(userId)).thenReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> notificationService.getNotifications(userToken, pageable))
                .isInstanceOf(NotFoundException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.USER_NOT_FOUND.getCode());
    }

    @Test
    @DisplayName("알림 읽음 표시 성공")
    void markAsReadSuccess() {
        // given
        Long userId = 1L;
        Long notificationId = 1L;
        UserToken userToken = mock(UserToken.class);
        UserProfile user = mock(UserProfile.class);
        Notification notification = mock(Notification.class);

        when(userToken.userId()).thenReturn(userId);
        when(userProfileRepository.findById(userId)).thenReturn(Optional.of(user));
        when(notificationJpaRepository.findById(notificationId)).thenReturn(Optional.of(notification));
        when(notification.getReceiver()).thenReturn(user);
        when(user.getId()).thenReturn(userId);

        // when
        notificationService.markAsRead(userToken, notificationId);

        // then
        verify(notification).markAsRead();
    }

    @Test
    @DisplayName("알림 읽음 표시 실패 - 다른 사용자의 알림")
    void markAsReadFail_NotYourNotification() {
        // given
        Long userId = 1L;
        Long otherUserId = 2L;
        Long notificationId = 1L;
        UserToken userToken = mock(UserToken.class);
        UserProfile user = mock(UserProfile.class);
        UserProfile otherUser = mock(UserProfile.class);
        Notification notification = mock(Notification.class);

        when(userToken.userId()).thenReturn(userId);
        when(userProfileRepository.findById(userId)).thenReturn(Optional.of(user));
        when(notificationJpaRepository.findById(notificationId)).thenReturn(Optional.of(notification));
        when(notification.getReceiver()).thenReturn(otherUser);
        when(user.getId()).thenReturn(userId);
        when(otherUser.getId()).thenReturn(otherUserId);

        // when & then
        assertThatThrownBy(() -> notificationService.markAsRead(userToken, notificationId))
                .isInstanceOf(ForbiddenException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.NOTIFICATION_NOT_YOURS.getCode());
    }
}
