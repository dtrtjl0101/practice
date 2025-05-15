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
import qwerty.chaekit.domain.member.user.UserProfileRepository;
import qwerty.chaekit.dto.group.enums.MyMemberShipStatus;
import qwerty.chaekit.dto.group.request.GroupPatchRequest;
import qwerty.chaekit.dto.group.request.GroupPostRequest;
import qwerty.chaekit.dto.group.response.GroupFetchResponse;
import qwerty.chaekit.dto.group.response.GroupJoinResponse;
import qwerty.chaekit.dto.group.response.GroupPendingMemberResponse;
import qwerty.chaekit.dto.group.response.GroupPostResponse;
import qwerty.chaekit.dto.page.PageResponse;
import qwerty.chaekit.global.enums.ErrorCode;
import qwerty.chaekit.global.exception.ForbiddenException;
import qwerty.chaekit.global.exception.NotFoundException;
import qwerty.chaekit.global.security.resolver.UserToken;
import qwerty.chaekit.service.notification.NotificationService;
import qwerty.chaekit.service.util.EmailNotificationService;
import qwerty.chaekit.service.util.FileService;

@Service
@RequiredArgsConstructor
public class GroupService {
    private final UserProfileRepository userRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final GroupRepository groupRepository;
    private final EmailNotificationService emailNotificationService;
    private final NotificationService notificationService;
    private final FileService fileService;

    @Transactional
    public GroupPostResponse createGroup(UserToken userToken, GroupPostRequest request) {
        Long userId = userToken.userId();
        if(!userRepository.existsById(userId)) {
            throw new NotFoundException(ErrorCode.USER_NOT_FOUND);
        }

        if(groupRepository.existsReadingGroupByName(request.name())) {
            throw new ForbiddenException(ErrorCode.GROUP_NAME_DUPLICATED);
        }

        String groupImageKey = fileService.uploadGroupImageIfPresent(request.groupImage());

        ReadingGroup groupEntity = ReadingGroup.builder()
                .name(request.name())
                .groupLeader(userRepository.getReferenceById(userId))
                .description(request.description())
                .groupImageKey(groupImageKey)
                .build();
        ReadingGroup savedGroup = groupRepository.save(groupEntity);
        if(request.tags() != null) {
            request.tags().forEach(savedGroup::addTag);
        }
        savedGroup.addMember(userRepository.getReferenceById(userId)).approve();

        return GroupPostResponse.of(savedGroup, getGroupImageURL(savedGroup));
    }

    @Transactional(readOnly = true)
    public PageResponse<GroupFetchResponse> fetchAllGroupList(UserToken userToken, Pageable pageable) {
        boolean isAnonymous = userToken.isAnonymous();
        Long userId = isAnonymous ? null : userToken.userId();

        Page<GroupFetchResponse> page = groupRepository.findAllWithGroupMembersAndTags(pageable)
                .map(
                        group -> GroupFetchResponse.of(
                                group,
                                getGroupImageURL(group),
                                isAnonymous ? MyMemberShipStatus.NONE : group.getMemberShipStatus(userId)
                        )
                );
        return PageResponse.of(page);
    }

    @Transactional(readOnly = true)
    public GroupFetchResponse fetchGroup(UserToken userToken, long groupId) {
        boolean isAnonymous = userToken.isAnonymous();
        Long userId = isAnonymous ? null : userToken.userId();

        ReadingGroup group = groupRepository.findByIdWithGroupMembersAndTags(groupId)
                .orElseThrow(() -> new NotFoundException(ErrorCode.GROUP_NOT_FOUND));
        return GroupFetchResponse.of(
                group,
                getGroupImageURL(group),
                isAnonymous ? MyMemberShipStatus.NONE : group.getMemberShipStatus(userId)
        );
    }

    @Transactional
    public GroupPostResponse updateGroup(UserToken userToken, long groupId, GroupPatchRequest request) {
        Long userId = userToken.userId();
        if(!userRepository.existsById(userId)) {
            throw new NotFoundException(ErrorCode.USER_NOT_FOUND);
        }

        ReadingGroup group = groupRepository.findById(groupId)
                .orElseThrow(() -> new NotFoundException(ErrorCode.GROUP_NOT_FOUND));

        if (!group.getGroupLeader().getId().equals(userId)) {
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
        UserProfile userProfile = userRepository.findByIdWithMember(userToken.userId())
                .orElseThrow(() -> new NotFoundException(ErrorCode.USER_NOT_FOUND));

        ReadingGroup group = groupRepository.findById(groupId)
                .orElseThrow(() -> new NotFoundException(ErrorCode.GROUP_NOT_FOUND));

        if (group.isMember(userProfile)) {
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
        UserProfile leaderProfile = userRepository.findByIdWithMember(userToken.userId())
                .orElseThrow(() -> new NotFoundException(ErrorCode.USER_NOT_FOUND));

        ReadingGroup group = groupRepository.findById(groupId)
                .orElseThrow(() -> new NotFoundException(ErrorCode.GROUP_NOT_FOUND));

        if (!group.getGroupLeader().getId().equals(leaderProfile.getId())) {
            throw new ForbiddenException(ErrorCode.GROUP_UPDATE_FORBIDDEN);
        }

        UserProfile memberProfile = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException(ErrorCode.USER_NOT_FOUND));

        GroupMember groupMember = group.approveMember(memberProfile);


        notificationService.createGroupJoinApprovedNotification(
            memberProfile,
            leaderProfile,
            group
        );
        
        emailNotificationService.sendReadingGroupApprovalEmail(memberProfile.getMember().getEmail());
        return GroupJoinResponse.of(groupMember);
    }

    @Transactional
    public void leaveGroup(UserToken userToken, long groupId) {
        UserProfile userProfile = userRepository.findByMember_Id(userToken.memberId())
                .orElseThrow(() -> new NotFoundException(ErrorCode.USER_NOT_FOUND));

        ReadingGroup group = groupRepository.findById(groupId)
                .orElseThrow(() -> new NotFoundException(ErrorCode.GROUP_NOT_FOUND));

        if (group.getGroupLeader().getId().equals(userProfile.getId())) {
            throw new ForbiddenException(ErrorCode.GROUP_LEADER_CANNOT_LEAVE);
        }

        group.removeMember(userProfile);
    }

    @Transactional
    public void rejectJoinRequest(UserToken userToken, long groupId, long userId) {
        UserProfile leaderProfile = userRepository.findByMember_Id(userToken.memberId())
                .orElseThrow(() -> new NotFoundException(ErrorCode.USER_NOT_FOUND));

        ReadingGroup group = groupRepository.findById(groupId)
                .orElseThrow(() -> new NotFoundException(ErrorCode.GROUP_NOT_FOUND));

        if (!group.getGroupLeader().getId().equals(leaderProfile.getId())) {
            throw new ForbiddenException(ErrorCode.GROUP_UPDATE_FORBIDDEN);
        }

        UserProfile memberProfile = userRepository.findByMember_Id(userId)
                .orElseThrow(() -> new NotFoundException(ErrorCode.USER_NOT_FOUND));

        group.rejectMember(memberProfile);

        notificationService.createGroupJoinRejectedNotification(
            memberProfile,
            leaderProfile,
            group
        );
    }

    @Transactional
    public PageResponse<GroupPendingMemberResponse> fetchPendingList(Pageable pageable, UserToken userToken, long groupId) {
        ReadingGroup group = groupRepository.findById(groupId)
                .orElseThrow(() -> new NotFoundException(ErrorCode.GROUP_NOT_FOUND));

        if (!group.getGroupLeader().getId().equals(userToken.userId())) {
            throw new ForbiddenException(ErrorCode.GROUP_LEADER_ONLY);
        }

        Page<GroupMember> pendingMembersPage = groupMemberRepository.findByReadingGroupAndAcceptedFalse(group, pageable);

        Page<GroupPendingMemberResponse> page = pendingMembersPage.map(
                groupMember -> GroupPendingMemberResponse.of(
                        groupMember,
                        getGroupImageURL(group)
                )
        );

        return PageResponse.of(page);
    }

    private String getGroupImageURL(ReadingGroup group) {
        return fileService.convertToPublicImageURL(group.getGroupImageKey());
    }
}