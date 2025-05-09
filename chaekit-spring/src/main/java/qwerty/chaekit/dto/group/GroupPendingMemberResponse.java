package qwerty.chaekit.dto.group;

import lombok.Builder;
import qwerty.chaekit.domain.group.groupmember.GroupMember;

@Builder
public record GroupPendingMemberResponse(
        Long userId,
        String nickname
) {
    public static GroupPendingMemberResponse of(GroupMember groupMember) {
        return GroupPendingMemberResponse.builder()
                .userId(groupMember.getUser().getId())
                .nickname(groupMember.getUser().getNickname())
                .build();
    }
}
