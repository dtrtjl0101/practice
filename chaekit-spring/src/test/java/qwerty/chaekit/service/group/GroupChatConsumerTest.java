package qwerty.chaekit.service.group;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import qwerty.chaekit.dto.group.chat.GroupChatResponse;

import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GroupChatConsumerTest {

    @InjectMocks
    private GroupChatConsumer groupChatConsumer;

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @Test
    @DisplayName("Kafka 메시지를 소비하고 웹소켓으로 전송한다")
    void consumeAndSendMessage() {
        // given
        GroupChatResponse chatResponse = new GroupChatResponse(
            1L,
            1L,
            1L,
            "테스트유저",
                null,
                "테스트 메세지",
                null
        );

        // when
        groupChatConsumer.consume(chatResponse);

        // then
        verify(messagingTemplate).convertAndSend("/topic/group/" + 1L, chatResponse);
    }

}
