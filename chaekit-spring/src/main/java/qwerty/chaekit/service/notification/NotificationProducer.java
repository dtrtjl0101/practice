package qwerty.chaekit.service.notification;

import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import qwerty.chaekit.dto.group.chat.GroupChatResponse;
import qwerty.chaekit.dto.notification.NotificationResponse;

@Service
@RequiredArgsConstructor
public class NotificationProducer {
    private final KafkaTemplate<String, NotificationResponse> kafkaTemplate;
    private static final String TOPIC = "notification-topic";

    public void sendNotification(NotificationResponse response, String receiverId) {
        kafkaTemplate.send(TOPIC, receiverId, response);
    }
}
