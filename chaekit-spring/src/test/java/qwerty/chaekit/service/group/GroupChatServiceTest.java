package qwerty.chaekit.service.group;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import qwerty.chaekit.domain.group.ReadingGroup;
import qwerty.chaekit.domain.group.chat.GroupChat;
import qwerty.chaekit.domain.group.chat.repository.GroupChatRepository;
import qwerty.chaekit.domain.member.user.UserProfile;
import qwerty.chaekit.dto.group.chat.GroupChatRequest;
import qwerty.chaekit.dto.group.chat.GroupChatResponse;
import qwerty.chaekit.dto.page.PageResponse;
import qwerty.chaekit.global.enums.ErrorCode;
import qwerty.chaekit.global.exception.ForbiddenException;
import qwerty.chaekit.global.security.resolver.UserToken;
import qwerty.chaekit.service.util.EntityFinder;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GroupChatServiceTest {

    @InjectMocks
    private GroupChatService groupChatService;
    @Mock
    private GroupChatRepository groupChatRepository;
    @Mock
    private EntityFinder entityFinder;
    @Mock
    private GroupChatProducer groupChatProducer;
    @Mock
    private GroupChatConsumer groupChatConsumer;

    @Test
    @DisplayName("채팅 생성")
    void createChatSuccess() {
        // given
        UserProfile userProfile = mock(UserProfile.class);
        UserToken userToken = UserToken.of(userProfile);
        Long groupId = 1L;
        String content = "테스트 메시지";
        GroupChatRequest request = new GroupChatRequest(content);

        UserProfile user = mock(UserProfile.class);
        ReadingGroup group = mock(ReadingGroup.class);
        GroupChat chat = mock(GroupChat.class);

        when(entityFinder.findUser(userToken.userId())).thenReturn(user);
        when(entityFinder.findGroup(groupId)).thenReturn(group);
        when(group.isNotAcceptedMember(user)).thenReturn(false);
        when(groupChatRepository.save(any(GroupChat.class))).thenReturn(chat);
        when(chat.getId()).thenReturn(1L);
        when(chat.getCreatedAt()).thenReturn(LocalDateTime.now());
        when(user.getId()).thenReturn(1L);
        when(user.getNickname()).thenReturn("테스트유저");
        when(user.getProfileImageKey()).thenReturn("profile.jpg");

        // when
        GroupChatResponse response = groupChatService.createChat(userToken, groupId, request);

        // then
        assertThat(response).isNotNull();
        assertThat(response.content()).isEqualTo(content);
        verify(groupChatRepository).save(any(GroupChat.class));
        verify(groupChatProducer).sendMessage(any(GroupChatResponse.class));
    }

    @Test
    @DisplayName("그룹 멤버가 아닐때")
    void createChatFailWhenNotGroupMember() {
        // given
        UserProfile userProfile = mock(UserProfile.class);
        UserToken userToken = UserToken.of(userProfile);
        Long groupId = 1L;
        GroupChatRequest request = new GroupChatRequest("테스트 메시지");

        UserProfile user = mock(UserProfile.class);
        ReadingGroup group = mock(ReadingGroup.class);

        when(entityFinder.findUser(userToken.userId())).thenReturn(user);
        when(entityFinder.findGroup(groupId)).thenReturn(group);
        when(group.isNotAcceptedMember(user)).thenReturn(true);

        // when & then
        assertThatThrownBy(() -> groupChatService.createChat(userToken, groupId, request))
                .isInstanceOf(ForbiddenException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.MEMBER_NOT_FOUND.getCode());
    }

    @Test
    @DisplayName("수신 성공")
    void getChatsSuccess() {
        // given
        Long groupId = 1L;
        Pageable pageable = PageRequest.of(0, 10);
        ReadingGroup group = mock(ReadingGroup.class);
        GroupChat chat = mock(GroupChat.class);
        UserProfile user = mock(UserProfile.class);
        Page<GroupChat> chatPage = new PageImpl<>(List.of(chat));

        when(entityFinder.findGroup(groupId)).thenReturn(group);
        when(groupChatRepository.findByGroupOrderByCreatedAtDesc(group, pageable)).thenReturn(chatPage);

        // GroupChat 모킹 설정
        when(chat.getGroup()).thenReturn(group);
        when(chat.getAuthor()).thenReturn(user);
        when(chat.getContent()).thenReturn("테스트 메시지");
        when(chat.getCreatedAt()).thenReturn(LocalDateTime.now());
        when(chat.getId()).thenReturn(1L);
        when(user.getId()).thenReturn(1L);
        when(user.getNickname()).thenReturn("테스트유저");
        when(user.getProfileImageKey()).thenReturn("profile.jpg");

        // when
        PageResponse<GroupChatResponse> response = groupChatService.getChats(groupId, pageable);

        // then
        assertThat(response).isNotNull();
        verify(groupChatRepository).findByGroupOrderByCreatedAtDesc(group, pageable);
    }
}
