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
import qwerty.chaekit.domain.group.groupmember.GroupMemberRepository;
import qwerty.chaekit.domain.member.Member;
import qwerty.chaekit.domain.member.enums.Role;
import qwerty.chaekit.domain.member.user.UserProfile;
import qwerty.chaekit.dto.group.response.GroupJoinResponse;
import qwerty.chaekit.dto.group.response.GroupMemberResponse;
import qwerty.chaekit.dto.page.PageResponse;
import qwerty.chaekit.global.exception.ForbiddenException;
import qwerty.chaekit.global.security.resolver.UserToken;
import qwerty.chaekit.mapper.GroupMapper;
import qwerty.chaekit.service.notification.NotificationService;
import qwerty.chaekit.service.util.EmailNotificationService;
import qwerty.chaekit.service.util.EntityFinder;
import qwerty.chaekit.service.util.FileService;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class GroupMemberServiceTest {
    @InjectMocks
    private GroupMemberService groupMemberService;

    @Mock
    private GroupMemberRepository groupMemberRepository;
    @Mock
    private EmailNotificationService emailNotificationService;
    @Mock
    private NotificationService notificationService;
    @Mock
    private FileService fileService;
    @Mock
    private GroupMapper groupMapper;
    @Mock
    private EntityFinder entityFinder;

    @Test
    void requestGroupJoin_autoApproval() {
        long userId = 1L;
        long groupId = 10L;
        UserToken token = UserToken.of(userId, userId, "u@b.c");
        UserProfile user = UserProfile.builder()
                .id(userId)
                .member(Member.builder().id(1L).email("u@b.c").password("p").role(Role.ROLE_USER).build())
                .nickname("u").build();
        UserProfile leader = UserProfile.builder().id(2L).build();
        ReadingGroup group = ReadingGroup.builder().id(groupId).groupLeader(leader).isAutoApproval(true).build();

        when(entityFinder.findUser(userId)).thenReturn(user);
        when(entityFinder.findGroup(groupId)).thenReturn(group);

        GroupJoinResponse response = groupMemberService.requestGroupJoin(token, groupId);

        assertTrue(response.isAccepted());
        verify(notificationService).createGroupJoinApprovedNotification(user, leader, group);
    }

    @Test
    void approveJoinRequest_success() {
        long leaderId = 1L;
        long memberId = 2L;
        long groupId = 20L;
        UserToken token = UserToken.of(leaderId, leaderId, "l@b.c");
        UserProfile leader = UserProfile.builder().id(leaderId).build();
        UserProfile member = UserProfile.builder().id(memberId).member(Member.builder().id(3L).email("m@b.c").password("p").role(Role.ROLE_USER).build()).nickname("m").build();
        ReadingGroup group = ReadingGroup.builder().id(groupId).groupLeader(leader).isAutoApproval(false).build();
        group.addMember(member); // pending

        when(entityFinder.findUser(leaderId)).thenReturn(leader);
        when(entityFinder.findGroup(groupId)).thenReturn(group);
        when(entityFinder.findUser(memberId)).thenReturn(member);

        GroupJoinResponse response = groupMemberService.approveJoinRequest(token, groupId, memberId);

        assertTrue(response.isAccepted());
        verify(notificationService).createGroupJoinApprovedNotification(member, leader, group);
        verify(emailNotificationService).sendReadingGroupApprovalEmail(member.getMember().getEmail());
    }

    @Test
    void leaveGroup_leaderCannotLeave() {
        long userId = 1L;
        long groupId = 5L;
        UserToken token = UserToken.of(userId, userId, "test@ex.com");
        UserProfile user = UserProfile.builder().id(userId).build();
        ReadingGroup group = ReadingGroup.builder().id(groupId).groupLeader(user).build();

        when(entityFinder.findUser(userId)).thenReturn(user);
        when(entityFinder.findGroup(groupId)).thenReturn(group);

        assertThrows(ForbiddenException.class, () -> groupMemberService.leaveGroup(token, groupId));
    }

    @Test
    void fetchPendingList_success() {
        long leaderId = 1L;
        long groupId = 30L;
        UserToken token = UserToken.of(leaderId, leaderId, "leader@b.c");
        UserProfile leader = UserProfile.builder().id(leaderId).build();
        ReadingGroup group = ReadingGroup.builder().id(groupId).groupLeader(leader).build();
        GroupMember gm = new GroupMember(group, UserProfile.builder().id(5L).build());
        Page<GroupMember> page = new PageImpl<>(List.of(gm));
        Pageable pageable = PageRequest.of(0, 10);
        GroupMemberResponse resp = GroupMemberResponse.builder().userId(5L).build();

        when(entityFinder.findUser(leaderId)).thenReturn(leader);
        when(entityFinder.findGroup(groupId)).thenReturn(group);
        when(groupMemberRepository.findByPendingMemberWithUser(group, pageable)).thenReturn(page);
        when(groupMapper.toGroupMemberResponse(gm)).thenReturn(resp);

        PageResponse<GroupMemberResponse> result = groupMemberService.fetchPendingList(pageable, token, groupId);

        assertEquals(1, result.content().size());
        verify(groupMapper).toGroupMemberResponse(gm);
    }

    @Test
    void kickGroupMember_success() {
        long leaderId = 1L;
        long targetId = 2L;
        long groupId = 40L;
        UserToken token = UserToken.of(leaderId, leaderId, "l@b.c");
        UserProfile leader = UserProfile.builder().id(leaderId).build();
        UserProfile target = UserProfile.builder().id(targetId).build();
        ReadingGroup group = ReadingGroup.builder().id(groupId).groupLeader(leader).build();
        GroupMember gm = group.addMember(target);
        gm.approve();

        when(entityFinder.findUser(leaderId)).thenReturn(leader);
        when(entityFinder.findUser(targetId)).thenReturn(target);
        when(entityFinder.findGroup(groupId)).thenReturn(group);

        groupMemberService.kickGroupMember(token, groupId, targetId);

        verify(notificationService).createGroupBannedNotification(target, group);
    }
}