package qwerty.chaekit.service.notification;

import lombok.RequiredArgsConstructor;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import qwerty.chaekit.dto.notification.NotificationResponse;

@Service
@RequiredArgsConstructor
public class NotificationConsumer {
    private final SimpMessagingTemplate messagingTemplate;

    @KafkaListener(topics = "notification-topic", groupId = "notification-group")
    public void consume(NotificationResponse notification) {
        if (notification.senderId() != null) {
            messagingTemplate.convertAndSend("/topic/notification/" + notification.senderId(), notification);
        }
    }
} 