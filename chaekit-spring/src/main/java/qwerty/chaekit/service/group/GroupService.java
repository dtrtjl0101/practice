package qwerty.chaekit.service.group;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import qwerty.chaekit.domain.group.groupmember.GroupMember;
import qwerty.chaekit.domain.group.groupmember.GroupMemberRepository;
import qwerty.chaekit.domain.group.repository.GroupRepository;
import qwerty.chaekit.domain.group.ReadingGroup;
import qwerty.chaekit.domain.member.user.UserProfile;
import qwerty.chaekit.dto.group.request.GroupPatchRequest;
import qwerty.chaekit.dto.group.request.GroupPostRequest;
import qwerty.chaekit.dto.group.response.GroupFetchResponse;
import qwerty.chaekit.dto.group.response.GroupJoinResponse;
import qwerty.chaekit.dto.group.response.GroupMemberResponse;
import qwerty.chaekit.dto.group.response.GroupPostResponse;
import qwerty.chaekit.dto.page.PageResponse;
import qwerty.chaekit.global.enums.ErrorCode;
import qwerty.chaekit.global.exception.ForbiddenException;
import qwerty.chaekit.global.exception.NotFoundException;
import qwerty.chaekit.global.security.resolver.UserToken;
import qwerty.chaekit.mapper.GroupMapper;
import qwerty.chaekit.service.notification.NotificationService;
import qwerty.chaekit.service.util.EmailNotificationService;
import qwerty.chaekit.service.util.EntityFinder;
import qwerty.chaekit.service.util.FileService;

@Service
@Transactional
@RequiredArgsConstructor
public class GroupService {
    private final GroupMemberRepository groupMemberRepository;
    private final GroupRepository groupRepository;
    private final EmailNotificationService emailNotificationService;
    private final NotificationService notificationService;
    private final FileService fileService;
    private final GroupMapper groupMapper;
    private final EntityFinder entityFinder;

    @Transactional
    public GroupPostResponse createGroup(UserToken userToken, GroupPostRequest request) {
        UserProfile leader = entityFinder.findUser(userToken.userId());

        if(groupRepository.existsReadingGroupByName(request.name())) {
            throw new ForbiddenException(ErrorCode.GROUP_NAME_DUPLICATED);
        }

        String groupImageKey = fileService.uploadGroupImageIfPresent(request.groupImage());

        ReadingGroup groupEntity = ReadingGroup.builder()
                .name(request.name())
                .groupLeader(leader)
                .description(request.description())
                .groupImageKey(groupImageKey)
                .build();
        ReadingGroup savedGroup = groupRepository.save(groupEntity);
        if(request.tags() != null) {
            savedGroup.addTags(request.tags());
        }
        savedGroup.addMember(leader).approve();

        return GroupPostResponse.of(savedGroup, getGroupImageURL(savedGroup));
    }

    @Transactional(readOnly = true)
    public PageResponse<GroupFetchResponse> getAllGroups(UserToken userToken, Pageable pageable) {
        boolean isAnonymous = userToken.isAnonymous();
        Long userId = isAnonymous ? null : userToken.userId();

        Page<GroupFetchResponse> page = groupRepository.findAll(pageable)
                .map(group -> groupMapper.toGroupFetchResponse(group, userId));
        return PageResponse.of(page);
    }

    @Transactional(readOnly = true)
    public PageResponse<GroupFetchResponse> getJoinedGroups(UserToken userToken, Pageable pageable) {
        Long userId = userToken.userId();

        Page<GroupFetchResponse> page = groupRepository.findAllByUserId(userId, pageable)
                .map(group -> groupMapper.toGroupFetchResponse(group, userId));
        return PageResponse.of(page);
    }

    @Transactional(readOnly = true)
    public PageResponse<GroupFetchResponse> getCreatedGroups(UserToken userToken, Pageable pageable) {
        Long userId = userToken.userId();

        Page<GroupFetchResponse> page = groupRepository.findByGroupLeaderId(userId, pageable)
                .map(group -> groupMapper.toGroupFetchResponse(group, userId));

        return PageResponse.of(page);
    }

    @Transactional(readOnly = true)
    public PageResponse<GroupMemberResponse> getGroupMembers(long groupId, Pageable pageable) {

        Page<GroupMemberResponse> page = groupMemberRepository.findByReadingGroupId(groupId, pageable)
                .map(
                        groupMember -> GroupMemberResponse.of(
                                groupMember,
                                getGroupImageURL(groupMember.getGroup())
                        )
                );
        return PageResponse.of(page);
    }

    @Transactional(readOnly = true)
    public GroupFetchResponse fetchGroup(UserToken userToken, long groupId) {
        boolean isAnonymous = userToken.isAnonymous();
        Long userId = isAnonymous ? null : userToken.userId();

        ReadingGroup group = groupRepository.findByIdWithTags(groupId)
                .orElseThrow(() -> new NotFoundException(ErrorCode.GROUP_NOT_FOUND));
        return groupMapper.toGroupFetchResponse(group, userId);
    }

    @Transactional
    public GroupPostResponse updateGroup(UserToken userToken, long groupId, GroupPatchRequest request) {
        UserProfile user = entityFinder.findUser(userToken.userId());
        ReadingGroup group = entityFinder.findGroup(groupId);

        if (!group.isLeader(user)) {
            throw new ForbiddenException(ErrorCode.GROUP_UPDATE_FORBIDDEN);
        }
        if(request.description() != null) {
            group.updateDescription(request.description());
        }

        String imageKey = fileService.uploadGroupImageIfPresent(request.groupImage());

        if(imageKey != null) {
            group.updateGroupImageKey(imageKey);
        }
        return GroupPostResponse.of(group, getGroupImageURL(group));
    }

    @Transactional
    public GroupJoinResponse requestJoinGroup(UserToken userToken, long groupId) {
        UserProfile userProfile = entityFinder.findUser(userToken.userId());
        ReadingGroup group = entityFinder.findGroup(groupId);

        if (group.isMemberAlreadyRequested(userProfile)) {
            throw new ForbiddenException(ErrorCode.ALREADY_JOINED_GROUP);
        }

        GroupMember groupMember = group.addMember(userProfile);

        notificationService.createGroupJoinRequestNotification(
            group.getGroupLeader(),
            userProfile,
            group
        );
        
        return GroupJoinResponse.of(groupMember);
    }

    @Transactional
    public GroupJoinResponse approveJoinRequest(UserToken userToken, long groupId, long userId) {
        GroupApprovalContext ctx = prepareGroupApproval(userToken, groupId, userId);
        UserProfile pendingMember = ctx.pendingMember;
        UserProfile groupLeader = ctx.leader;
        ReadingGroup group = ctx.group;

        GroupMember groupMember = group.approveMember(pendingMember);

        notificationService.createGroupJoinApprovedNotification(
            pendingMember,
            groupLeader,
            group
        );
        
        emailNotificationService.sendReadingGroupApprovalEmail(pendingMember.getMember().getEmail());
        return GroupJoinResponse.of(groupMember);
    }

    @Transactional
    public void rejectJoinRequest(UserToken userToken, long groupId, long userId) {
        GroupApprovalContext ctx = prepareGroupApproval(userToken, groupId, userId);
        UserProfile pendingMember = ctx.pendingMember;
        UserProfile groupLeader = ctx.leader;
        ReadingGroup group = ctx.group;

        group.rejectMember(pendingMember);

        notificationService.createGroupJoinRejectedNotification(
            pendingMember,
            groupLeader,
            group
        );
    }

    private record GroupApprovalContext(
            ReadingGroup group,
            UserProfile leader,
            UserProfile pendingMember
    ) {}

    private GroupApprovalContext prepareGroupApproval(UserToken userToken, long groupId, long userId) {
        UserProfile leaderProfile = entityFinder.findUser(userToken.userId());
        ReadingGroup group = entityFinder.findGroup(groupId);

        if (!group.isLeader(leaderProfile)) {
            throw new ForbiddenException(ErrorCode.GROUP_LEADER_ONLY);
        }

        if (!group.isPendingMember(userId)) {
            throw new ForbiddenException(ErrorCode.GROUP_MEMBER_NOT_PENDING);
        }

        UserProfile memberProfile = entityFinder.findUser(userId);
        return new GroupApprovalContext(group, leaderProfile, memberProfile);
    }

    @Transactional
    public void leaveGroup(UserToken userToken, long groupId) {
        UserProfile userProfile = entityFinder.findUser(userToken.userId());
        ReadingGroup group = entityFinder.findGroup(groupId);

        if (group.getGroupLeader().getId().equals(userProfile.getId())) {
            throw new ForbiddenException(ErrorCode.GROUP_LEADER_CANNOT_LEAVE);
        }

        group.removeMember(userProfile);
    }

    @Transactional(readOnly = true)
    public PageResponse<GroupMemberResponse> fetchPendingList(Pageable pageable, UserToken userToken, long groupId) {
        UserProfile user = entityFinder.findUser(userToken.userId());
        ReadingGroup group = entityFinder.findGroup(groupId);

        if (!group.isLeader(user)) {
            throw new ForbiddenException(ErrorCode.GROUP_LEADER_ONLY);
        }

        Page<GroupMember> pendingMembersPage = groupMemberRepository.findByPendingMemberWithUser(group, pageable);

        Page<GroupMemberResponse> page = pendingMembersPage.map(groupMapper::toGroupMemberResponse);

        return PageResponse.of(page);
    }

    private String getGroupImageURL(ReadingGroup group) {
        return fileService.convertToPublicImageURL(group.getGroupImageKey());
    }
}