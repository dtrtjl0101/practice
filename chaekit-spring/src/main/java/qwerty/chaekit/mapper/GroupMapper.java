package qwerty.chaekit.mapper;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import qwerty.chaekit.domain.group.ReadingGroup;
import qwerty.chaekit.domain.group.groupmember.GroupMember;
import qwerty.chaekit.domain.group.grouptag.GroupTag;
import qwerty.chaekit.dto.group.response.GroupFetchResponse;
import qwerty.chaekit.dto.group.response.GroupMemberResponse;
import qwerty.chaekit.service.util.FileService;

@Component
@RequiredArgsConstructor
public class GroupMapper {
    private final FileService fileService;

    public String convertToPublicImageURL(String imageKey) {
        return fileService.convertToPublicImageURL(imageKey);
    }

    /*
     * fetch required:
     *   - ReadingGroup.tags
     *   - ReadingGroup.groupMembers
     *   - ReadingGroup.groupLeader
     */
    public GroupFetchResponse toGroupFetchResponse(ReadingGroup group, Long userId) {
        return GroupFetchResponse.builder()
                .groupId(group.getId())
                .name(group.getName())
                .description(group.getDescription())
                .tags(group.getTags().stream()
                        .map(GroupTag::getTagName)
                        .toList())
                .groupImageURL(convertToPublicImageURL(group.getGroupImageKey()))
                .myMemberShipStatus(group.getMemberShipStatus(userId))
                .leaderId(group.getGroupLeader().getId())
                .leaderNickname(group.getGroupLeader().getNickname())
                .leaderProfileImageURL(convertToPublicImageURL(group.getGroupLeader().getProfileImageKey()))
                .memberCount((int) group.memberCount())
                .build();
    }

    /*
     * fetch required:
     *   - GroupMember.user
     *   - GroupMember.group
     */
    public GroupMemberResponse toGroupMemberResponse(GroupMember groupMember) {
        return GroupMemberResponse.builder()
                .userId(groupMember.getUser().getId())
                .nickname(groupMember.getUser().getNickname())
                .profileImageURL(convertToPublicImageURL(groupMember.getGroup().getGroupImageKey()))
                .createdAt(groupMember.getCreatedAt())
                .approvedAt(groupMember.getApprovedAt())
                .build();
    }
}
