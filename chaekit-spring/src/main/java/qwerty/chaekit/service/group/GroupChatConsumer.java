package qwerty.chaekit.service.group;

import lombok.RequiredArgsConstructor;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import qwerty.chaekit.domain.group.ReadingGroup;
import qwerty.chaekit.domain.group.chat.GroupChat;
import qwerty.chaekit.domain.group.chat.repository.GroupChatRepository;
import qwerty.chaekit.domain.member.user.UserProfile;
import qwerty.chaekit.dto.group.chat.GroupChatResponse;
import qwerty.chaekit.service.util.EntityFinder;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class GroupChatConsumer {
    private final SimpMessagingTemplate messagingTemplate;
    private static final String TOPIC = "group-chat";
    //private final Map<Long, GroupChatResponse> realtimeMessages = new ConcurrentHashMap<>();

    @KafkaListener(topics = TOPIC, groupId = "group-chat-group")
    public void consume(GroupChatResponse message) {
        //realtimeMessages.put(message.chatId(), message);
        messagingTemplate.convertAndSend("/topic/group/" + message.groupId(), message);//웹소켓으로 보내는것.
    }

    //public void subscribeToGroupChat(Long groupId) {
    //    messagingTemplate.convertAndSend("/topic/group/" + groupId + "/subscribe", "subscribed");
    //}
}