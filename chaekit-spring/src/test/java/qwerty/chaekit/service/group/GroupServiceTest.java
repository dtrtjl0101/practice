package qwerty.chaekit.service.group;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import qwerty.chaekit.domain.group.ReadingGroup;
import qwerty.chaekit.domain.group.groupmember.GroupMember;
import qwerty.chaekit.domain.group.repository.GroupRepository;
import qwerty.chaekit.domain.member.user.UserProfile;
import qwerty.chaekit.dto.group.request.GroupPostRequest;
import qwerty.chaekit.dto.group.response.GroupPostResponse;
import qwerty.chaekit.global.enums.ErrorCode;
import qwerty.chaekit.global.exception.ForbiddenException;
import qwerty.chaekit.global.security.resolver.UserToken;
import qwerty.chaekit.mapper.GroupMapper;
import qwerty.chaekit.service.util.EntityFinder;
import qwerty.chaekit.service.util.FileService;
import qwerty.chaekit.domain.highlight.repository.HighlightRepository;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GroupServiceTest {
    @InjectMocks
    private GroupService groupService;

    @Mock
    private GroupRepository groupRepository;
    @Mock
    private FileService fileService;
    @Mock
    private GroupMapper groupMapper;
    @Mock
    private EntityFinder entityFinder;
    @Mock
    private HighlightRepository highlightRepository;

    @Test
    void createGroup_success() {
        // Given
        UserProfile loginUser = UserProfile.builder()
                .id(1L)
                .nickname("Test User")
                .build();
        UserToken loginUserToken = UserToken.of(loginUser);
        GroupPostRequest req = new GroupPostRequest(
                "Test Group",
                "This is a test group.",
                List.of("tag1", "tag2"),
                null,
                true
        );

        when(entityFinder.findUser(1L)).thenReturn(loginUser);
        when(groupRepository.existsReadingGroupByName("Test Group")).thenReturn(false);
        when(fileService.uploadGroupImageIfPresent(null)).thenReturn(null);

        ReadingGroup savedGroup = spy(ReadingGroup.builder()
                .id(10L)
                .name("Test Group")
                .groupLeader(loginUser)
                .description("This is a test group.")
                .groupImageKey(null)
                .isAutoApproval(true)
                .build());
        when(groupRepository.save(any(ReadingGroup.class))).thenReturn(savedGroup);
        doNothing().when(savedGroup).addTags(anyList());

        GroupMember groupMember = mock(GroupMember.class);
        when(savedGroup.addMember(any())).thenReturn(groupMember);
        doNothing().when(groupMember).approve();
        
        when(fileService.convertToPublicImageURL(null)).thenReturn("http://image.url/group.png");

        // When
        GroupPostResponse response = groupService.createGroup(loginUserToken, req);

        // Then
        assertNotNull(response);
        assertEquals("Test Group", response.name());
        assertEquals("http://image.url/group.png", response.groupImageURL());
        verify(savedGroup, times(1)).addMember(loginUser);
        verify(groupMember, times(1)).approve();
        verify(savedGroup, times(1)).addTags(List.of("tag1", "tag2"));
    }

    @Test
    void createGroup_duplicateName_throwsException() {
        // Given
        UserProfile leader = UserProfile.builder().id(1L).nickname("dup").build();
        UserToken loginUserToken = UserToken.of(leader);
        GroupPostRequest req = new GroupPostRequest(
                "Test Group",
                "desc",
                List.of("tag1"),
                null,
                true
        );
        when(entityFinder.findUser(1L)).thenReturn(leader);
        when(groupRepository.existsReadingGroupByName("Test Group")).thenReturn(true);

        // When & Then
        ForbiddenException ex = assertThrows(ForbiddenException.class, () -> {
            groupService.createGroup(loginUserToken, req);
        });
        assertEquals(ErrorCode.GROUP_NAME_DUPLICATED.getCode(), ex.getErrorCode());
    }
}
