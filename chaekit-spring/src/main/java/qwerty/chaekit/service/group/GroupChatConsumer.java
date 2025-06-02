package qwerty.chaekit.service.group;

import lombok.RequiredArgsConstructor;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import qwerty.chaekit.dto.group.chat.GroupChatResponse;

@Service
@RequiredArgsConstructor
public class GroupChatConsumer {
    private final SimpMessagingTemplate messagingTemplate;
    private static final String TOPIC = "group-chat";

    @KafkaListener(topics = TOPIC, groupId = "group-chat-group")
    public void consume(GroupChatResponse message) {
        messagingTemplate.convertAndSend("/topic/group/" + message.groupId(), message);
    }
} 