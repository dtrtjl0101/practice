package qwerty.chaekit.service.notification;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import qwerty.chaekit.domain.notification.entity.NotificationType;
import qwerty.chaekit.dto.notification.NotificationResponse;

import java.time.LocalDateTime;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class NotificationConsumerTest {
    @InjectMocks
    private NotificationConsumer notificationConsumer;

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @Test
    void consume_success() {
        // given
        NotificationResponse notification = new NotificationResponse(
                1L,                // id
                "테스트 알림",      // message
                NotificationType.GROUP_JOIN_REQUEST,  // type
                false,             // isRead
                LocalDateTime.now(), // createdAt
                1L,                // senderId
                "테스트유저",       // senderNickname
                1L,                // groupId
                "테스트그룹",       // groupName
                null,              // highlightId
                null,              // highlightComments
                null,              // discussionId
                null,              // discussionContents
                null,              // discussionCommentsId
                null               // discussionCommentsContents
        );

        // when
        notificationConsumer.consume(notification);

        // then
        verify(messagingTemplate).convertAndSend(
                eq("/topic/notification/1"),
                eq(notification)
        );
    }

    @Test
    void consume_nullSenderId_doNothing() {
        // given
        NotificationResponse notification = new NotificationResponse(
                1L,                // id
                "테스트 알림",      // message
                NotificationType.GROUP_JOIN_REQUEST,  // type
                false,             // isRead
                LocalDateTime.now(), // createdAt
                null,              // senderId
                null,              // senderNickname
                1L,                // groupId
                "테스트그룹",       // groupName
                null,              // highlightId
                null,              // highlightComments
                null,              // discussionId
                null,              // discussionContents
                null,              // discussionCommentsId
                null               // discussionCommentsContents
        );


        // when
        notificationConsumer.consume(notification);

        // then
        verify(messagingTemplate, never()).convertAndSend(any(String.class), any(NotificationResponse.class));
    }
}
