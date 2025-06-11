package qwerty.chaekit.service.group;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
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
import qwerty.chaekit.service.util.FileService;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class GroupChatServiceTest {

    @InjectMocks
    private GroupChatService groupChatService;

    @Mock
    private GroupChatRepository groupChatRepository;
    @Mock
    private EntityFinder entityFinder;
    @Mock
    private FileService fileService;
    @Mock
    private SimpMessagingTemplate simpMessagingTemplate;

    @Test
    @DisplayName("그룹 채팅 생성 성공")
    void createChatSuccess() {
        // given
        Long userId = 1L;
        Long groupId = 1L;
        UserProfile user = mock(UserProfile.class);
        UserToken userToken = mock(UserToken.class);
        ReadingGroup group = mock(ReadingGroup.class);
        GroupChat chat = mock(GroupChat.class);

        GroupChatRequest request = new GroupChatRequest("test content");

        when(userToken.userId()).thenReturn(userId);
        when(entityFinder.findUser(userId)).thenReturn(user);
        when(entityFinder.findGroup(groupId)).thenReturn(group);
        when(group.isNotAcceptedMember(user)).thenReturn(false);
        when(groupChatRepository.save(any(GroupChat.class))).thenReturn(chat);
        when(chat.getId()).thenReturn(1L);
        when(chat.getCreatedAt()).thenReturn(LocalDateTime.now());
        when(user.getId()).thenReturn(userId);
        when(user.getNickname()).thenReturn("testUser");
        when(user.getProfileImageKey()).thenReturn("profileImageKey");
        when(fileService.convertToPublicImageURL("profileImageKey")).thenReturn("profileImageURL");

        // when
        GroupChatResponse response = groupChatService.createChat(userToken, groupId, request);

        // then
        assertThat(response).isNotNull();
        assertThat(response.content()).isEqualTo("test content");
        assertThat(response.authorId()).isEqualTo(userId);
        assertThat(response.authorName()).isEqualTo("testUser");
        verify(simpMessagingTemplate).convertAndSend("/topic/group/" + groupId, response);
    }

    @Test
    @DisplayName("그룹 채팅 생성 실패 - 그룹 멤버가 아닌 경우")
    void createChatFail_NotGroupMember() {
        // given
        Long userId = 1L;
        Long groupId = 1L;
        UserProfile user = mock(UserProfile.class);
        UserToken userToken = mock(UserToken.class);
        ReadingGroup group = mock(ReadingGroup.class);

        GroupChatRequest request = new GroupChatRequest("test content");

        when(userToken.userId()).thenReturn(userId);
        when(entityFinder.findUser(userId)).thenReturn(user);
        when(entityFinder.findGroup(groupId)).thenReturn(group);
        when(group.isNotAcceptedMember(user)).thenReturn(true);

        // when
        ForbiddenException exception = assertThrows(
                ForbiddenException.class,
                () -> groupChatService.createChat(userToken, groupId, request)
        );

        // then
        assertThat(exception.getErrorCode()).isEqualTo(ErrorCode.MEMBER_NOT_FOUND.getCode());
    }

    @Test
    @DisplayName("그룹 채팅 목록 조회 성공")
    void getChatsSuccess() {
        // given
        Long userId = 1L;
        Long groupId = 1L;
        UserProfile user = mock(UserProfile.class);
        UserToken userToken = mock(UserToken.class);
        ReadingGroup group = mock(ReadingGroup.class);
        GroupChat chat = mock(GroupChat.class);
        UserProfile author = mock(UserProfile.class);
        Page<GroupChat> chatPage = new PageImpl<>(List.of(chat));
        Pageable pageable = PageRequest.of(0, 20);
        LocalDateTime now = LocalDateTime.now();

        when(userToken.userId()).thenReturn(userId);
        when(entityFinder.findUser(userId)).thenReturn(user);
        when(entityFinder.findGroup(groupId)).thenReturn(group);
        when(groupChatRepository.findByGroupOrderByCreatedAtDesc(group, pageable)).thenReturn(chatPage);
        when(chat.getAuthor()).thenReturn(author);
        when(chat.getGroup()).thenReturn(group);
        when(chat.getCreatedAt()).thenReturn(now);
        when(author.getId()).thenReturn(userId);
        when(author.getNickname()).thenReturn("testUser");
        when(author.getProfileImageKey()).thenReturn("profile.jpg");
        when(fileService.convertToPublicImageURL("profile.jpg")).thenReturn("presigned-profile.jpg");

        // when
        PageResponse<GroupChatResponse> result = groupChatService.getChats(groupId, pageable);

        // then
        assertThat(result).isNotNull();
        assertThat(result.content()).hasSize(1);
        GroupChatResponse response = result.content().get(0);
        assertThat(response.authorId()).isEqualTo(userId);
        assertThat(response.authorName()).isEqualTo("testUser");
        assertThat(response.authorProfileImage()).isEqualTo("presigned-profile.jpg");
        verify(groupChatRepository).findByGroupOrderByCreatedAtDesc(group, pageable);
    }
}
