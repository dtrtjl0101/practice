package qwerty.chaekit.service.notification;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
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
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class NotificationServiceTest {

    @InjectMocks
    private NotificationService notificationService;

    @Mock
    private NotificationJpaRepository notificationJpaRepository;

    @Mock
    private UserProfileRepository userProfileRepository;

    @Mock
    private SimpMessagingTemplate simpMessagingTemplate;

    private UserProfile receiver;
    private UserProfile sender;
    private ReadingGroup group;
    private Notification notification;
    private PublisherProfile publisher;
    private Discussion discussion;
    private DiscussionComment discussionComment;
    private Highlight highlight;
    private HighlightComment highlightComment;

    @BeforeEach
    void setUp() {
        receiver = mock(UserProfile.class);
        sender = mock(UserProfile.class);
        group = mock(ReadingGroup.class);
        notification = mock(Notification.class);
        publisher = mock(PublisherProfile.class);
        discussion = mock(Discussion.class);
        discussionComment = mock(DiscussionComment.class);
        highlight = mock(Highlight.class);
        highlightComment = mock(HighlightComment.class);

        when(sender.getNickname()).thenReturn("sender");
        when(group.getName()).thenReturn("group");
        when(discussion.getTitle()).thenReturn("discussion");
        when(highlight.getMemo()).thenReturn("highlight memo");
        when(highlightComment.getHighlight()).thenReturn(highlight);
        when(discussionComment.getDiscussion()).thenReturn(discussion);
        when(receiver.getId()).thenReturn(1L);
        when(notification.getReceiver()).thenReturn(receiver);
    }

    @Test
    @DisplayName("그룹 가입 요청 알림 생성 성공")
    void createGroupJoinRequestNotificationSuccess() {
        // given
        when(notificationJpaRepository.save(any(Notification.class))).thenReturn(notification);

        // when
        notificationService.createGroupJoinRequestNotification(receiver, sender, group);

        // then
        verify(notificationJpaRepository).save(any(Notification.class));
        verify(simpMessagingTemplate).convertAndSend(eq("/topic/notification/1"), any(NotificationResponse.class));
    }

    @Test
    @DisplayName("그룹 가입 승인 알림 생성 성공")
    void createGroupJoinApprovedNotificationSuccess() {
        // given
        when(notificationJpaRepository.save(any(Notification.class))).thenReturn(notification);

        // when
        notificationService.createGroupJoinApprovedNotification(receiver, sender, group);

        // then
        verify(notificationJpaRepository).save(any(Notification.class));
        verify(simpMessagingTemplate).convertAndSend(eq("/topic/notification/1"), any(NotificationResponse.class));
    }

    @Test
    @DisplayName("그룹 가입 거절 알림 생성 성공")
    void createGroupJoinRejectedNotificationSuccess() {
        // given
        when(notificationJpaRepository.save(any(Notification.class))).thenReturn(notification);

        // when
        notificationService.createGroupJoinRejectedNotification(receiver, sender, group);

        // then
        verify(notificationJpaRepository).save(any(Notification.class));
        verify(simpMessagingTemplate).convertAndSend(eq("/topic/notification/1"), any(NotificationResponse.class));
    }

    @Test
    @DisplayName("출판사 승인 알림 생성 성공")
    void createPublisherApprovedNotificationSuccess() {
        // given
        when(notificationJpaRepository.save(any(Notification.class))).thenReturn(notification);

        // when
        notificationService.createPublisherApprovedNotification(publisher, sender);

        // then
        verify(notificationJpaRepository).save(any(Notification.class));
    }

    @Test
    @DisplayName("토론 댓글 알림 생성 성공")
    void createDiscussionCommentNotificationSuccess() {
        // given
        when(notificationJpaRepository.save(any(Notification.class))).thenReturn(notification);

        // when
        notificationService.createDiscussionCommentNotification(receiver, sender, discussion);

        // then
        verify(notificationJpaRepository).save(any(Notification.class));
        verify(simpMessagingTemplate).convertAndSend(eq("/topic/notification/1"), any(NotificationResponse.class));
    }

    @Test
    @DisplayName("댓글 답글 알림 생성 성공")
    void createCommentReplyNotificationSuccess() {
        // given
        when(notificationJpaRepository.save(any(Notification.class))).thenReturn(notification);

        // when
        notificationService.createCommentReplyNotification(receiver, sender, discussionComment);

        // then
        verify(notificationJpaRepository).save(any(Notification.class));
        verify(simpMessagingTemplate).convertAndSend(eq("/topic/notification/1"), any(NotificationResponse.class));
    }

    @Test
    @DisplayName("하이라이트 댓글 알림 생성 성공")
    void createHighlightCommentNotificationSuccess() {
        // given
        when(notificationJpaRepository.save(any(Notification.class))).thenReturn(notification);

        // when
        notificationService.createHighlightCommentNotification(receiver, sender, highlight);

        // then
        verify(notificationJpaRepository).save(any(Notification.class));
        verify(simpMessagingTemplate).convertAndSend(eq("/topic/notification/1"), any(NotificationResponse.class));
    }

    @Test
    @DisplayName("하이라이트 댓글 답글 알림 생성 성공")
    void createHighlightCommentReplyNotificationSuccess() {
        // given
        when(notificationJpaRepository.save(any(Notification.class))).thenReturn(notification);

        // when
        notificationService.createHighlightCommentReplyNotification(receiver, sender, highlightComment);

        // then
        verify(notificationJpaRepository).save(any(Notification.class));
        verify(simpMessagingTemplate).convertAndSend(eq("/topic/notification/1"), any(NotificationResponse.class));
    }

    @Test
    @DisplayName("그룹 추방 알림 생성 성공")
    void createGroupBannedNotificationSuccess() {
        // given
        when(notificationJpaRepository.save(any(Notification.class))).thenReturn(notification);

        // when
        notificationService.createGroupBannedNotification(receiver, group);

        // then
        verify(notificationJpaRepository).save(any(Notification.class));
        verify(simpMessagingTemplate).convertAndSend(eq("/topic/notification/1"), any(NotificationResponse.class));
    }

    @Test
    @DisplayName("알림 목록 조회 성공")
    void getNotificationsSuccess() {
        // given
        UserToken userToken = new UserToken(false, 1L, 1L, "test@test.com");
        Pageable pageable = PageRequest.of(0, 10);
        List<Notification> notifications = List.of(notification);
        Page<Notification> notificationPage = new PageImpl<>(notifications);

        when(userProfileRepository.findById(userToken.userId())).thenReturn(Optional.of(receiver));
        when(notificationJpaRepository.findByReceiverOrderByCreatedAtDesc(receiver, pageable))
            .thenReturn(notificationPage);

        // when
        PageResponse<NotificationResponse> result = notificationService.getNotifications(userToken, pageable);

        // then
        assertThat(result.content()).hasSize(1);
        verify(userProfileRepository).findById(userToken.userId());
        verify(notificationJpaRepository).findByReceiverOrderByCreatedAtDesc(receiver, pageable);
    }

    @Test
    @DisplayName("알림 목록 조회 실패 - 사용자를 찾을 수 없음")
    void getNotificationsFailUserNotFound() {
        // given
        UserToken userToken = new UserToken(false, 1L, 1L, "test@test.com");
        Pageable pageable = PageRequest.of(0, 10);

        when(userProfileRepository.findById(userToken.userId())).thenReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> notificationService.getNotifications(userToken, pageable))
            .isInstanceOf(NotFoundException.class)
            .hasFieldOrPropertyWithValue("errorCode", ErrorCode.USER_NOT_FOUND.getCode());
    }

    @Test
    @DisplayName("알림 읽음 표시 성공")
    void markAsReadSuccess() {
        // given
        UserToken userToken = new UserToken(false, 1L, 1L, "test@test.com");
        Long notificationId = 1L;

        when(userProfileRepository.findById(userToken.userId())).thenReturn(Optional.of(receiver));
        when(notificationJpaRepository.findById(notificationId)).thenReturn(Optional.of(notification));
        when(notification.getReceiver()).thenReturn(receiver);
        when(receiver.getId()).thenReturn(1L);

        // when
        notificationService.markAsRead(userToken, notificationId);

        // then
        verify(notification).markAsRead();
    }

    @Test
    @DisplayName("알림 읽음 표시 실패 - 사용자를 찾을 수 없음")
    void markAsReadFailUserNotFound() {
        // given
        UserToken userToken = new UserToken(false, 1L, 1L, "test@test.com");
        Long notificationId = 1L;

        when(userProfileRepository.findById(userToken.userId())).thenReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> notificationService.markAsRead(userToken, notificationId))
            .isInstanceOf(NotFoundException.class)
            .hasFieldOrPropertyWithValue("errorCode", ErrorCode.USER_NOT_FOUND.getCode());
    }

    @Test
    @DisplayName("알림 읽음 표시 실패 - 알림을 찾을 수 없음")
    void markAsReadFailNotificationNotFound() {
        // given
        UserToken userToken = new UserToken(false, 1L, 1L, "test@test.com");
        Long notificationId = 1L;

        when(userProfileRepository.findById(userToken.userId())).thenReturn(Optional.of(receiver));
        when(notificationJpaRepository.findById(notificationId)).thenReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> notificationService.markAsRead(userToken, notificationId))
            .isInstanceOf(NotFoundException.class)
            .hasFieldOrPropertyWithValue("errorCode", ErrorCode.NOTIFICATION_NOT_FOUND.getCode());
    }

    @Test
    @DisplayName("알림 읽음 표시 실패 - 자신의 알림이 아님")
    void markAsReadFailNotYourNotification() {
        // given
        UserToken userToken = new UserToken(false, 1L, 1L, "test@test.com");
        Long notificationId = 1L;
        UserProfile otherUser = mock(UserProfile.class);

        when(userProfileRepository.findById(userToken.userId())).thenReturn(Optional.of(receiver));
        when(notificationJpaRepository.findById(notificationId)).thenReturn(Optional.of(notification));
        when(notification.getReceiver()).thenReturn(otherUser);
        when(otherUser.getId()).thenReturn(2L);
        when(receiver.getId()).thenReturn(1L);

        // when & then
        assertThatThrownBy(() -> notificationService.markAsRead(userToken, notificationId))
            .isInstanceOf(ForbiddenException.class)
            .hasFieldOrPropertyWithValue("errorCode", ErrorCode.NOTIFICATION_NOT_YOURS.getCode());
    }
}
