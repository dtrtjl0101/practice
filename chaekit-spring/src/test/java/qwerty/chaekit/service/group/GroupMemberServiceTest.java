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

    @Test
    void getGroupMembers_success() {
        long groupId = 100L;
        Pageable pageable = PageRequest.of(0, 10);
        UserProfile groupLeader = UserProfile.builder().id(5L).build();
        GroupMember gm = new GroupMember(
                ReadingGroup.builder().id(groupId).groupLeader(groupLeader).build(), 
                UserProfile.builder().id(1L).build()
        );
        Page<GroupMember> page = new PageImpl<>(List.of(gm));

        when(groupMemberRepository.findByReadingGroupId(groupId, pageable)).thenReturn(page);
        when(fileService.convertToPublicImageURL(gm.getUser().getProfileImageKey())).thenReturn("img-url");

        PageResponse<GroupMemberResponse> result = groupMemberService.getGroupMembers(groupId, pageable);

        assertEquals(1, result.content().size());
        assertEquals(1L, result.content().get(0).userId());
    }

    @Test
    void requestGroupJoin_autoApproval_success() {
        long userId = 1L;
        long groupId = 10L;
        UserToken token = UserToken.of(userId, userId, "u@b.c");
        UserProfile user = UserProfile.builder().id(userId).build();
        UserProfile leader = UserProfile.builder().id(2L).build();
        ReadingGroup group = ReadingGroup.builder().id(groupId).groupLeader(leader).isAutoApproval(true).build();

        when(entityFinder.findUser(userId)).thenReturn(user);
        when(entityFinder.findGroup(groupId)).thenReturn(group);

        GroupJoinResponse response = groupMemberService.requestGroupJoin(token, groupId);

        assertTrue(response.isAccepted());
        verify(notificationService).createGroupJoinApprovedNotification(user, leader, group);
    }

    @Test
    void requestGroupJoin_alreadyJoined_throws() {
        long userId = 1L;
        long groupId = 10L;
        UserToken token = UserToken.of(userId, userId, "u@b.c");
        UserProfile user = UserProfile.builder().id(userId).build();
        ReadingGroup group = org.mockito.Mockito.spy(ReadingGroup.builder().id(groupId).groupLeader(UserProfile.builder().id(2L).build()).isAutoApproval(true).build());

        when(entityFinder.findUser(userId)).thenReturn(user);
        when(entityFinder.findGroup(groupId)).thenReturn(group);
        when(group.isMemberAlreadyRequested(user)).thenReturn(true);

        assertThrows(ForbiddenException.class, () -> groupMemberService.requestGroupJoin(token, groupId));
    }

    @Test
    void requestGroupJoin_requestSuccess() {
        long userId = 1L;
        long groupId = 10L;
        UserToken token = UserToken.of(userId, userId, "u@b.c");
        UserProfile user = UserProfile.builder().id(userId).build();
        UserProfile leader = UserProfile.builder().id(2L).build();
        ReadingGroup group = org.mockito.Mockito.spy(ReadingGroup.builder().id(groupId).groupLeader(leader).isAutoApproval(false).build());

        when(entityFinder.findUser(userId)).thenReturn(user);
        when(entityFinder.findGroup(groupId)).thenReturn(group);
        when(group.isMemberAlreadyRequested(user)).thenReturn(false);
        // addMember 호출 시 pending 상태로 반환
        GroupMember gm = new GroupMember(group, user);
        org.mockito.Mockito.doReturn(gm).when(group).addMember(user);

        GroupJoinResponse response = groupMemberService.requestGroupJoin(token, groupId);

        assertFalse(response.isAccepted());
        verify(notificationService).createGroupJoinRequestNotification(leader, user, group);
    }

    @Test
    void rejectJoinRequest_success() {
        long leaderId = 1L;
        long memberId = 2L;
        long groupId = 20L;
        UserToken token = UserToken.of(leaderId, leaderId, "l@b.c");
        UserProfile leader = UserProfile.builder().id(leaderId).build();
        UserProfile member = UserProfile.builder().id(memberId).build();
        ReadingGroup group = org.mockito.Mockito.spy(ReadingGroup.builder().id(groupId).groupLeader(leader).isAutoApproval(false).build());

        when(entityFinder.findUser(leaderId)).thenReturn(leader);
        when(entityFinder.findGroup(groupId)).thenReturn(group);
        when(entityFinder.findUser(memberId)).thenReturn(member);
        when(group.isLeader(leader)).thenReturn(true);
        when(group.isPendingMember(memberId)).thenReturn(true);

        groupMemberService.rejectJoinRequest(token, groupId, memberId);

        verify(group).rejectMember(member);
        verify(notificationService).createGroupJoinRejectedNotification(member, leader, group);
    }

    @Test
    void leaveGroup_success() {
        long userId = 1L;
        long groupId = 5L;
        UserToken token = UserToken.of(userId, userId, "test@ex.com");
        UserProfile user = UserProfile.builder().id(userId).build();
        UserProfile leader = UserProfile.builder().id(99L).build();
        ReadingGroup group = org.mockito.Mockito.spy(ReadingGroup.builder().id(groupId).groupLeader(leader).build());

        when(entityFinder.findUser(userId)).thenReturn(user);
        when(entityFinder.findGroup(groupId)).thenReturn(group);

        groupMemberService.leaveGroup(token, groupId);

        verify(group).removeMember(user);
    }
}
