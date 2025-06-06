package qwerty.chaekit.service.group;

import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import qwerty.chaekit.dto.group.chat.GroupChatResponse;

@Service
@RequiredArgsConstructor
public class GroupChatProducer {
    private final KafkaTemplate<String, GroupChatResponse> kafkaTemplate;
    private static final String TOPIC = "group-chat";

    public void sendMessage(GroupChatResponse message) {
        kafkaTemplate.send(TOPIC, message);
    }
} 