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
    private final GroupChatRepository groupChatRepository;
    private final EntityFinder entityFinder;
    private static final String TOPIC = "group-chat";
    
    // 실시간 메시지를 저장할 맵
    private final Map<Long, GroupChatResponse> realtimeMessages = new ConcurrentHashMap<>();

    @KafkaListener(topics = TOPIC, groupId = "group-chat-group")
    public void consume(GroupChatResponse message) {
        // 1. DB에 메시지 저장
        ReadingGroup group = entityFinder.findGroup(message.groupId());
        UserProfile author = entityFinder.findUser(message.authorId());
        
        GroupChat chat = GroupChat.builder()
                .group(group)
                .author(author)
                .content(message.content())
                .build();
        
        groupChatRepository.save(chat);

        // 2. 실시간 메시지 맵에 저장
        realtimeMessages.put(message.chatId(), message);

        // 3. WebSocket을 통해 실시간 전송
        messagingTemplate.convertAndSend("/topic/group/" + message.groupId(), message);
    }

    // 특정 그룹의 실시간 메시지 구독
    public void subscribeToGroupChat(Long groupId) {
        // WebSocket 구독 설정
        messagingTemplate.convertAndSend("/topic/group/" + groupId + "/subscribe", "subscribed");
    }

    // 실시간 메시지 조회
    public GroupChatResponse getRealtimeMessage(Long chatId) {
        return realtimeMessages.get(chatId);
    }

    // 실시간 메시지 맵 초기화
    public void clearRealtimeMessages() {
        realtimeMessages.clear();
    }
} 