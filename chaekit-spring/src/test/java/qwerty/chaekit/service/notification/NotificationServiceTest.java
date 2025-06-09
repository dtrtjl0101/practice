package qwerty.chaekit.service.notification;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import qwerty.chaekit.domain.group.ReadingGroup;
import qwerty.chaekit.domain.group.activity.discussion.Discussion;
import qwerty.chaekit.domain.group.activity.discussion.comment.DiscussionComment;
import qwerty.chaekit.domain.highlight.Highlight;
import qwerty.chaekit.domain.highlight.comment.HighlightComment;
import qwerty.chaekit.domain.member.publisher.PublisherProfile;
import qwerty.chaekit.domain.member.user.UserProfile;
import qwerty.chaekit.domain.member.user.UserProfileRepository;
import qwerty.chaekit.domain.notification.entity.Notification;
import qwerty.chaekit.domain.notification.repository.NotificationJpaRepository;
import qwerty.chaekit.dto.group.request.GroupPostRequest;
import qwerty.chaekit.dto.notification.NotificationResponse;
import qwerty.chaekit.dto.page.PageResponse;
import qwerty.chaekit.global.exception.ForbiddenException;
import qwerty.chaekit.global.exception.NotFoundException;
import qwerty.chaekit.global.security.resolver.UserToken;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;
import static qwerty.chaekit.domain.highlight.QHighlight.highlight;

@ExtendWith(MockitoExtension.class)
public class NotificationServiceTest {
    @InjectMocks
    private NotificationService notificationService;

    @Mock
    private NotificationJpaRepository notificationJpaRepository;
    @Mock
    private UserProfileRepository userProfileRepository;
    @Mock
    private NotificationProducer notificationProducer;

    @Test
    void createGroupJoinRequestNotification_success() {
        //given
        UserProfile receiver = mock(UserProfile.class);
        UserProfile sender = mock(UserProfile.class);
        ReadingGroup group = mock(ReadingGroup.class);

        when(sender.getNickname()).thenReturn("테스트유저");
        when(group.getName()).thenReturn("테스트그룹");
        when(receiver.getId()).thenReturn(1L);

        //when
        notificationService.createGroupJoinRequestNotification(receiver, sender, group);

        //then
        verify(notificationJpaRepository).save(any(Notification.class));
        verify(notificationProducer).sendNotification(any(NotificationResponse.class), eq("1"));
    }

    @Test
    void createGroupJoinApprovedNotification_success() {
        //given
        UserProfile receiver = mock(UserProfile.class);
        UserProfile sender = mock(UserProfile.class);
        ReadingGroup group = mock(ReadingGroup.class);

        when(group.getName()).thenReturn("테스트그룹");
        when(receiver.getId()).thenReturn(1L);

        //when
        notificationService.createGroupJoinApprovedNotification(receiver, sender, group);

        //then
        verify(notificationJpaRepository).save(any(Notification.class));
        verify(notificationProducer).sendNotification(any(NotificationResponse.class), eq("1"));
    }

    @Test
    void createGroupJoinRejectedNotification_success() {
        //given
        UserProfile receiver = mock(UserProfile.class);
        UserProfile sender = mock(UserProfile.class);
        ReadingGroup group = mock(ReadingGroup.class);

        when(group.getName()).thenReturn("테스트그룹");
        when(receiver.getId()).thenReturn(1L);

        //when
        notificationService.createGroupJoinRejectedNotification(receiver, sender, group);

        //then
        verify(notificationJpaRepository).save(any(Notification.class));
        verify(notificationProducer).sendNotification(any(NotificationResponse.class), eq("1"));
    }

    @Test
    void createPublisherJoinRequestNotification_success() {
        //given
        UserProfile admin = mock(UserProfile.class);
        PublisherProfile publisher = mock(PublisherProfile.class);

        when(publisher.getPublisherName()).thenReturn("테스트출판사");

        //when
        notificationService.createPublisherJoinRequestNotification(admin, publisher);

        //then
        verify(notificationJpaRepository).save(any(Notification.class));
    }

    @Test
    void createPublisherApprovedNotification_success() {
        //given
        UserProfile admin = mock(UserProfile.class);
        PublisherProfile publisher = mock(PublisherProfile.class);

        //when
        notificationService.createPublisherApprovedNotification(publisher,admin);

        //then
        verify(notificationJpaRepository).save(any(Notification.class));
    }

    @Test
    void createDiscussionCommentNotification_success() {
        //given
        UserProfile receiver = mock(UserProfile.class);
        UserProfile sender = mock(UserProfile.class);
        Discussion discussion = mock(Discussion.class);

        when(sender.getNickname()).thenReturn("테스트유저");
        when(discussion.getTitle()).thenReturn("테스트토론");
        when(receiver.getId()).thenReturn(1L);

        //when
        notificationService.createDiscussionCommentNotification(receiver, sender, discussion);

        //then
        verify(notificationJpaRepository).save(any(Notification.class));
        verify(notificationProducer).sendNotification(any(NotificationResponse.class), eq("1"));
    }

    @Test
    void createCommentReplyNotification_success() {
        //given
        UserProfile receiver = mock(UserProfile.class);
        UserProfile sender = mock(UserProfile.class);
        DiscussionComment comment = mock(DiscussionComment.class);

        when(sender.getNickname()).thenReturn("테스트유저");
        when(receiver.getId()).thenReturn(1L);

        //when
        notificationService.createCommentReplyNotification(receiver,sender,comment);

        //then
        verify(notificationJpaRepository).save(any(Notification.class));
        verify(notificationProducer).sendNotification(any(NotificationResponse.class), eq("1"));
    }

    @Test
    void createHighlightCommentNotification_success() {
        //given
        UserProfile receiver = mock(UserProfile.class);
        UserProfile sender = mock(UserProfile.class);
        Highlight highlight = mock(Highlight.class);

        when(sender.getNickname()).thenReturn("테스트유저");
        when(highlight.getMemo()).thenReturn("하이라이트 테스트 내용입니다.");
        when(receiver.getId()).thenReturn(1L);

        //when
        notificationService.createHighlightCommentNotification(receiver,sender,highlight);

        //then
        verify(notificationJpaRepository).save(any(Notification.class));
        verify(notificationProducer).sendNotification(any(NotificationResponse.class), eq("1"));
    }

    @Test
    void createHighlightCommentReplyNotification_success() {
        //given
        UserProfile receiver = mock(UserProfile.class);
        UserProfile sender = mock(UserProfile.class);
        HighlightComment comment = mock(HighlightComment.class);
        Highlight highlight = mock(Highlight.class);

        when(sender.getNickname()).thenReturn("테스트유저");
        when(comment.getHighlight()).thenReturn(highlight);
        when(highlight.getMemo()).thenReturn("테스트 메모");
        when(receiver.getId()).thenReturn(1L);

        //when
        notificationService.createHighlightCommentReplyNotification(receiver,sender,comment);

        //then
        verify(notificationJpaRepository).save(any(Notification.class));
        verify(notificationProducer).sendNotification(any(NotificationResponse.class), eq("1"));
    }

    @Test
    void createGroupBannedNotification_success() {
        //given
        UserProfile receiver = mock(UserProfile.class);
        ReadingGroup group = mock(ReadingGroup.class);

        when(group.getName()).thenReturn("테스트그룹");
        when(receiver.getId()).thenReturn(1L);

        //when
        notificationService.createGroupBannedNotification(receiver,group);

        //then
        verify(notificationJpaRepository).save(any(Notification.class));
        verify(notificationProducer).sendNotification(any(NotificationResponse.class), eq("1"));
    }

    @Test
    void getNotifications_success() {
        //given
        UserProfile userProfile = UserProfile.builder()
                .id(1L)
                .nickname("Test User")
                .build();
        UserToken userToken = UserToken.of(userProfile);
        Pageable pageable = PageRequest.of(0, 10);
        List<Notification> notifications = new ArrayList<>();
        Page<Notification> notificationPage = new PageImpl<>(notifications);

        when(userProfileRepository.findById(1L)).thenReturn(Optional.of(userProfile));
        when(notificationJpaRepository.findByReceiverOrderByCreatedAtDesc(eq(userProfile), any(Pageable.class)))
                .thenReturn(notificationPage);
        //when(notificationPage.map(any())).thenReturn(responsePage);

        //when
        PageResponse<NotificationResponse> response = notificationService.getNotifications(userToken, pageable);

        //then
        assertNotNull(response);
        verify(userProfileRepository).findById(1L);
    }

    @Test
    void getNotifications_userNotFound_throwsException() {
        // given
        UserProfile userProfile = UserProfile.builder()
                .id(1L)
                .nickname("Test User")
                .build();
        UserToken userToken = UserToken.of(userProfile);
        Pageable pageable = PageRequest.of(0, 10);

        when(userProfileRepository.findById(1L)).thenReturn(Optional.empty());

        // when&then
        assertThrows(NotFoundException.class, () -> {
            notificationService.getNotifications(userToken, pageable);
        });
    }

    @Test
    void markAsRead_success() {
        // given
        UserProfile userProfile = mock(UserProfile.class);
        UserToken userToken = UserToken.of(userProfile);
        Notification notification = mock(Notification.class);

        when(userProfileRepository.findById(anyLong())).thenReturn(Optional.of(userProfile));
        when(notificationJpaRepository.findById(1L)).thenReturn(Optional.of(notification));
        when(notification.getReceiver()).thenReturn(userProfile);
        when(userProfile.getId()).thenReturn(1L);

        // when
        notificationService.markAsRead(userToken, 1L);

        // then
        verify(notification).markAsRead();
    }

    @Test
    void markAsRead_notificationNotFound_throwsException() {
        // given
        UserProfile userProfile = UserProfile.builder()
                .id(1L)
                .nickname("Test User")
                .build();
        UserToken userToken = UserToken.of(userProfile);

        when(userProfileRepository.findById(1L)).thenReturn(Optional.of(userProfile));
        when(notificationJpaRepository.findById(1L)).thenReturn(Optional.empty());

        // when&then
        assertThrows(NotFoundException.class, () -> {
            notificationService.markAsRead(userToken, 1L);
        });
    }

    @Test
    void markAsRead_notYourNotification_throwsException() {
        //given
        UserProfile userProfile = mock(UserProfile.class);
        UserToken userToken = UserToken.of(userProfile);
        UserProfile otherUser = mock(UserProfile.class);
        Notification notification = mock(Notification.class);

        when(userProfileRepository.findById(anyLong())).thenReturn(Optional.of(userProfile));
        when(notificationJpaRepository.findById(1L)).thenReturn(Optional.of(notification));
        when(notification.getReceiver()).thenReturn(otherUser);
        when(userProfile.getId()).thenReturn(1L);
        when(otherUser.getId()).thenReturn(2L);

        //when&then
        assertThrows(ForbiddenException.class, () -> {
            notificationService.markAsRead(userToken, 1L);
        });
    }
}
