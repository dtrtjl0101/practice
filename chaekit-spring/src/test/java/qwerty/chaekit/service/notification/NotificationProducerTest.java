package qwerty.chaekit.service.notification;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.kafka.core.KafkaTemplate;
import qwerty.chaekit.domain.notification.entity.NotificationType;
import qwerty.chaekit.dto.notification.NotificationResponse;
import java.time.LocalDateTime;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class NotificationProducerTest {
    @InjectMocks
    private NotificationProducer notificationProducer;

    @Mock
    private KafkaTemplate<String, NotificationResponse> kafkaTemplate;

    @Test
    void sendNotification_success() {
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
        String receiverId = "1";

        // when
        notificationProducer.sendNotification(notification, receiverId);

        // then
        verify(kafkaTemplate).send(
                eq("notification-topic"),
                eq(receiverId),
                eq(notification)
        );
    }

    @Test
    void sendNotification_withDifferentReceiverId() {
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
        String receiverId = "2";

        // when
        notificationProducer.sendNotification(notification, receiverId);

        // then
        verify(kafkaTemplate).send(
                eq("notification-topic"),
                eq(receiverId),
                eq(notification)
        );
    }
}
