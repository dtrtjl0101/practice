package qwerty.chaekit.service.group;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import qwerty.chaekit.domain.group.GroupMember;
import qwerty.chaekit.domain.group.GroupRepository;
import qwerty.chaekit.domain.group.ReadingGroup;
import qwerty.chaekit.domain.member.user.UserProfile;
import qwerty.chaekit.domain.member.user.UserProfileRepository;
import qwerty.chaekit.dto.group.*;
import qwerty.chaekit.dto.page.PageResponse;
import qwerty.chaekit.global.enums.ErrorCode;
import qwerty.chaekit.global.exception.ForbiddenException;
import qwerty.chaekit.global.exception.NotFoundException;
import qwerty.chaekit.global.security.resolver.UserToken;

@Service
@RequiredArgsConstructor
public class GroupService {
    private final UserProfileRepository userRepository;
    private final GroupRepository groupRepository;

    @Transactional
    public GroupPostResponse createGroup(UserToken userToken, GroupPostRequest request) {
        Long userId = userToken.userId();
        if(!userRepository.existsById(userId)) {
            throw new NotFoundException(ErrorCode.USER_NOT_FOUND);
        }

        ReadingGroup groupEntity = ReadingGroup.builder()
                .name(request.name())
                .groupLeader(userRepository.getReferenceById(userId))
                .description(request.description())
                .build();
        ReadingGroup savedGroup = groupRepository.save(groupEntity);
        request.tags().forEach(savedGroup::addTag);
        return GroupPostResponse.of(groupEntity);
    }

    @Transactional(readOnly = true)
    public PageResponse<GroupFetchResponse> fetchGroupList(Pageable pageable) {
        Page<GroupFetchResponse> page = groupRepository.findAll(pageable).map(GroupFetchResponse::of);
        return PageResponse.of(page);
    }

    @Transactional(readOnly = true)
    public GroupFetchResponse fetchGroup(long groupId) {
        ReadingGroup group = groupRepository.findById(groupId)
                .orElseThrow(() -> new NotFoundException(ErrorCode.GROUP_NOT_FOUND));
        return GroupFetchResponse.of(group);
    }

    @Transactional
    public GroupPostResponse updateGroup(UserToken userToken, long groupId, GroupPutRequest request) {
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
        return GroupPostResponse.of(group);
    }

    @Transactional
    public GroupJoinResponse requestJoinGroup(UserToken userToken, long groupId) {
        UserProfile userProfile = userRepository.findByMember_Id(userToken.memberId())
                .orElseThrow(() -> new NotFoundException(ErrorCode.USER_NOT_FOUND));

        ReadingGroup group = groupRepository.findById(groupId)
                .orElseThrow(() -> new NotFoundException(ErrorCode.GROUP_NOT_FOUND));

        GroupMember groupMember = group.addMember(userProfile);
        return GroupJoinResponse.of(groupMember);
    }

    @Transactional
    public GroupJoinResponse approveJoinRequest(UserToken userToken, long groupId, long userId) {
        UserProfile leaderProfile = userRepository.findByMember_Id(userToken.memberId())
                .orElseThrow(() -> new NotFoundException(ErrorCode.USER_NOT_FOUND));

        ReadingGroup group = groupRepository.findById(groupId)
                .orElseThrow(() -> new NotFoundException(ErrorCode.GROUP_NOT_FOUND));

        if (!group.getGroupLeader().getId().equals(leaderProfile.getId())) {
            throw new ForbiddenException(ErrorCode.GROUP_UPDATE_FORBIDDEN);
        }

        UserProfile memberProfile = userRepository.findByMember_Id(userId)
                .orElseThrow(() -> new NotFoundException(ErrorCode.USER_NOT_FOUND));

        GroupMember groupMember = group.approveMember(memberProfile);
        return GroupJoinResponse.of(groupMember);
    }
}
