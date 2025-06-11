package qwerty.chaekit.service.group;

import org.apache.kafka.clients.producer.KafkaProducer;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.kafka.core.KafkaTemplate;
import qwerty.chaekit.dto.group.chat.GroupChatResponse;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
public class GroupChatProducerTest {
    @InjectMocks
    private GroupChatProducer groupChatProducer;
    @Mock
    private KafkaTemplate<String, GroupChatResponse> kafkaTemplate;

    @Test
    void sendMessage_success(){
        //given
        GroupChatResponse groupChatResponse=new GroupChatResponse(
                1L,
                1L,
                1L,
                "테스트유저",
                null,
                "테스트 메세지",
                null
        );
        //when
        groupChatProducer.sendMessage(groupChatResponse);
        //then
        verify(kafkaTemplate).send(
                eq("group-chat"),
                eq(groupChatResponse)
        );
    }
}
