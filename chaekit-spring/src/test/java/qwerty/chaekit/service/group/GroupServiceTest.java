package qwerty.chaekit.service.group;

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
import qwerty.chaekit.domain.group.groupmember.GroupMember;
import qwerty.chaekit.domain.group.repository.GroupRepository;
import qwerty.chaekit.domain.highlight.Highlight;
import qwerty.chaekit.domain.highlight.repository.HighlightRepository;
import qwerty.chaekit.domain.member.user.UserProfile;
import qwerty.chaekit.dto.group.request.GroupPatchRequest;
import qwerty.chaekit.dto.group.request.GroupPostRequest;
import qwerty.chaekit.dto.group.request.GroupSortType;
import qwerty.chaekit.dto.group.response.GroupFetchResponse;
import qwerty.chaekit.dto.group.response.GroupPostResponse;
import qwerty.chaekit.dto.page.PageResponse;
import qwerty.chaekit.global.enums.ErrorCode;
import qwerty.chaekit.global.exception.ForbiddenException;
import qwerty.chaekit.global.security.resolver.UserToken;
import qwerty.chaekit.mapper.GroupMapper;
import qwerty.chaekit.service.util.EntityFinder;
import qwerty.chaekit.service.util.FileService;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
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

        ReadingGroup savedGroup = mock(ReadingGroup.class);
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

    @Test
    void createGroup_invalidTags_throwsException() {
        // Given
        UserProfile loginUser = UserProfile.builder()
                .id(1L)
                .nickname("Test User")
                .build();
        UserToken loginUserToken = UserToken.of(loginUser);
        // tag가 10자를 초과하는 경우
        GroupPostRequest req = new GroupPostRequest(
                "Test Group",
                "desc",
                List.of("tag1", "tagtoolong1234567890"),
                null,
                true
        );

        when(entityFinder.findUser(1L)).thenReturn(loginUser);
        when(groupRepository.existsReadingGroupByName("Test Group")).thenReturn(false);
        when(fileService.uploadGroupImageIfPresent(null)).thenReturn(null);

        // When & Then
        qwerty.chaekit.global.exception.BadRequestException ex = assertThrows(
                qwerty.chaekit.global.exception.BadRequestException.class,
                () -> groupService.createGroup(loginUserToken, req)
        );
        assertEquals(qwerty.chaekit.global.enums.ErrorCode.INVALID_TAG_LIST.getCode(), ex.getErrorCode());
    }

    @Test
    void getAllGroups_newest_no_tags_success() {
        // Given
        UserProfile user = UserProfile.builder().id(1L).nickname("user").build();
        UserToken userToken = UserToken.of(user);
        Pageable pageable = PageRequest.of(0, 10);

        ReadingGroup group = mock(ReadingGroup.class);
        GroupFetchResponse fetchResponse = mock(GroupFetchResponse.class);
        Page<ReadingGroup> groupPage = new PageImpl<>(List.of(group));
        when(groupRepository.findAll(any(Pageable.class))).thenReturn(groupPage);
        when(groupMapper.toGroupFetchResponse(group, 1L)).thenReturn(fetchResponse);

        // When
        PageResponse<GroupFetchResponse> response = groupService.getAllGroups(userToken, pageable, null, GroupSortType.CREATED_AT);

        // Then
        assertNotNull(response);
        assertEquals(1, response.content().size());
        verify(groupMapper, times(1)).toGroupFetchResponse(group, 1L);
    }

    @Test
    void getAllGroups_newest_with_tags_success() {
        // Given
        UserProfile user = UserProfile.builder().id(1L).nickname("user").build();
        UserToken userToken = UserToken.of(user);
        Pageable pageable = PageRequest.of(0, 10);

        ReadingGroup group = mock(ReadingGroup.class);
        GroupFetchResponse fetchResponse = mock(GroupFetchResponse.class);
        Page<ReadingGroup> groupPage = new PageImpl<>(List.of(group));
        List<String> tags = List.of("tag1", "tag2");
        
        when(groupRepository.findAllByTagsIn(eq(tags), any(Pageable.class))).thenReturn(groupPage);
        when(groupMapper.toGroupFetchResponse(group, 1L)).thenReturn(fetchResponse);

        // When
        PageResponse<GroupFetchResponse> response = groupService.getAllGroups(userToken, pageable, tags, GroupSortType.CREATED_AT);

        // Then
        assertNotNull(response);
        assertEquals(1, response.content().size());
        verify(groupMapper, times(1)).toGroupFetchResponse(group, 1L);
    }

    @Test
    void getAllGroups_popular_with_tags_success() {
        // Given
        UserProfile user = UserProfile.builder().id(1L).nickname("user").build();
        UserToken userToken = UserToken.of(user);
        Pageable pageable = PageRequest.of(0, 10);

        ReadingGroup group = mock(ReadingGroup.class);
        GroupFetchResponse fetchResponse = mock(GroupFetchResponse.class);
        Page<ReadingGroup> groupPage = new PageImpl<>(List.of(group));
        List<String> tags = List.of("tag1", "tag2");

        when(groupRepository.findAllByTagsInOrderByMemberCountDesc(tags, pageable)).thenReturn(groupPage);
        when(groupMapper.toGroupFetchResponse(group, 1L)).thenReturn(fetchResponse);

        // When
        PageResponse<GroupFetchResponse> response = groupService.getAllGroups(userToken, pageable, tags, GroupSortType.MEMBER_COUNT);

        // Then
        assertNotNull(response);
        assertEquals(1, response.content().size());
        verify(groupMapper, times(1)).toGroupFetchResponse(group, 1L);
    }

    @Test
    void getAllGroups_popular_no_tags_success() {
        // Given
        UserProfile user = UserProfile.builder().id(1L).nickname("user").build();
        UserToken userToken = UserToken.of(user);
        Pageable pageable = PageRequest.of(0, 10);

        ReadingGroup group = mock(ReadingGroup.class);
        GroupFetchResponse fetchResponse = mock(GroupFetchResponse.class);
        Page<ReadingGroup> groupPage = new PageImpl<>(List.of(group));

        when(groupRepository.findAllOrderByMemberCountDesc(pageable)).thenReturn(groupPage);
        when(groupMapper.toGroupFetchResponse(group, 1L)).thenReturn(fetchResponse);

        // When
        PageResponse<GroupFetchResponse> response = groupService.getAllGroups(userToken, pageable, null, GroupSortType.MEMBER_COUNT);

        // Then
        assertNotNull(response);
        assertEquals(1, response.content().size());
        verify(groupMapper, times(1)).toGroupFetchResponse(group, 1L);
    }

    @Test
    void getJoinedGroups_success() {
        // Given
        UserProfile user = UserProfile.builder().id(2L).nickname("joined").build();
        UserToken userToken = UserToken.of(user);
        Pageable pageable = PageRequest.of(0, 5);

        ReadingGroup group = mock(ReadingGroup.class);
        GroupFetchResponse fetchResponse = mock(GroupFetchResponse.class);
        Page<ReadingGroup> groupPage = new PageImpl<>(List.of(group));
        when(groupRepository.findAllByUserId(2L, pageable)).thenReturn(groupPage);
        when(groupMapper.toGroupFetchResponse(group, 2L)).thenReturn(fetchResponse);

        // When
        PageResponse<GroupFetchResponse> response = groupService.getJoinedGroups(userToken, pageable);

        // Then
        assertNotNull(response);
        assertEquals(1, response.content().size());
        verify(groupMapper, times(1)).toGroupFetchResponse(group, 2L);
    }

    @Test
    void getCreatedGroups_success() {
        // Given
        UserProfile user = UserProfile.builder().id(3L).nickname("creator").build();
        UserToken userToken = UserToken.of(user);
        Pageable pageable = PageRequest.of(0, 3);

        ReadingGroup group = mock(ReadingGroup.class);
        GroupFetchResponse fetchResponse = mock(GroupFetchResponse.class);
        Page<ReadingGroup> groupPage = new PageImpl<>(List.of(group));
        when(groupRepository.findByGroupLeaderId(3L, pageable)).thenReturn(groupPage);
        when(groupMapper.toGroupFetchResponse(group, 3L)).thenReturn(fetchResponse);

        // When
        PageResponse<GroupFetchResponse> response = groupService.getCreatedGroups(userToken, pageable);

        // Then
        assertNotNull(response);
        assertEquals(1, response.content().size());
        verify(groupMapper, times(1)).toGroupFetchResponse(group, 3L);
    }

    @Test
    void fetchGroup_success() {
        // Given
        UserProfile user = UserProfile.builder().id(100L).nickname("fetcher").build();
        UserToken userToken = UserToken.of(user);
        ReadingGroup group = mock(ReadingGroup.class);
        GroupFetchResponse fetchResponse = mock(GroupFetchResponse.class);

        when(groupRepository.findByIdWithTags(123L)).thenReturn(java.util.Optional.of(group));
        when(groupMapper.toGroupFetchResponse(group, 100L)).thenReturn(fetchResponse);

        // When
        GroupFetchResponse response = groupService.fetchGroup(userToken, 123L);

        // Then
        assertNotNull(response);
        verify(groupRepository, times(1)).findByIdWithTags(123L);
        verify(groupMapper, times(1)).toGroupFetchResponse(group, 100L);
    }

    @Test
    void updateGroup_success() {
        // Given
        UserProfile leader = UserProfile.builder().id(10L).nickname("leader").build();
        UserToken leaderToken = UserToken.of(leader);
        GroupPatchRequest req = new GroupPatchRequest(
                "newName",
                List.of("tagA", "tagB"),
                "newDesc",
                null,
                false
        );
        ReadingGroup group = mock(ReadingGroup.class);

        when(entityFinder.findUser(10L)).thenReturn(leader);
        when(entityFinder.findGroup(100L)).thenReturn(group);
        when(group.isLeader(leader)).thenReturn(true);
        doNothing().when(group).updateDescription("newDesc");
        doNothing().when(group).removeAllTags();
        doNothing().when(group).addTags(List.of("tagA", "tagB"));
        doNothing().when(group).changeName("newName");
        doNothing().when(group).changeAutoApproval(false);
        when(fileService.uploadGroupImageIfPresent(null)).thenReturn("imgKey");
        doNothing().when(group).updateGroupImageKey("imgKey");
        when(fileService.convertToPublicImageURL(any())).thenReturn("http://img.url/group.png");

        // When
        GroupPostResponse response = groupService.updateGroup(leaderToken, 100L, req);

        // Then
        assertNotNull(response);
        verify(group, times(1)).updateDescription("newDesc");
        verify(group, times(1)).removeAllTags();
        verify(group, times(1)).addTags(List.of("tagA", "tagB"));
        verify(group, times(1)).changeName("newName");
        verify(group, times(1)).changeAutoApproval(false);
        verify(group, times(1)).updateGroupImageKey("imgKey");
    }

    @Test
    void updateGroup_notLeader_throwsException() {
        // Given
        UserProfile user = UserProfile.builder().id(11L).nickname("notLeader").build();
        UserToken userToken = UserToken.of(user);
        GroupPatchRequest req = new GroupPatchRequest(
                "name", List.of("tag"), "desc", null, true
        );
        ReadingGroup group = mock(ReadingGroup.class);

        when(entityFinder.findUser(11L)).thenReturn(user);
        when(entityFinder.findGroup(200L)).thenReturn(group);
        when(group.isLeader(user)).thenReturn(false);

        // When & Then
        ForbiddenException ex = assertThrows(ForbiddenException.class, () -> {
            groupService.updateGroup(userToken, 200L, req);
        });
        assertEquals(ErrorCode.GROUP_UPDATE_FORBIDDEN.getCode(), ex.getErrorCode());
    }

    @Test
    void deleteGroup_success() {
        // Given
        UserProfile leader = UserProfile.builder().id(20L).nickname("leader").build();
        UserToken leaderToken = UserToken.of(leader);
        ReadingGroup group = mock(ReadingGroup.class);

        when(entityFinder.findGroup(300L)).thenReturn(group);
        when(group.isLeader(20L)).thenReturn(true);

        Highlight highlight1 = mock(Highlight.class);
        Highlight highlight2 = mock(Highlight.class);
        List<Highlight> highlights = List.of(highlight1, highlight2);
        when(highlightRepository.findByGroup(group)).thenReturn(highlights);

        doNothing().when(highlight1).detachActivity();
        doNothing().when(highlight2).detachActivity();
        doNothing().when(groupRepository).delete(group);

        // When
        groupService.deleteGroup(leaderToken, 300L);

        // Then
        verify(highlight1, times(1)).detachActivity();
        verify(highlight2, times(1)).detachActivity();
        verify(groupRepository, times(1)).delete(group);
    }

    @Test
    void deleteGroup_notLeader_throwsException() {
        // Given
        UserProfile user = UserProfile.builder().id(21L).nickname("notLeader").build();
        UserToken userToken = UserToken.of(user);
        ReadingGroup group = mock(ReadingGroup.class);

        when(entityFinder.findGroup(400L)).thenReturn(group);
        when(group.isLeader(21L)).thenReturn(false);

        // When & Then
        ForbiddenException ex = assertThrows(ForbiddenException.class, () -> {
            groupService.deleteGroup(userToken, 400L);
        });
        assertEquals(ErrorCode.GROUP_LEADER_ONLY.getCode(), ex.getErrorCode());
    }
}
