package qwerty.chaekit.dto.group;

import lombok.Builder;
import qwerty.chaekit.domain.group.groupmember.GroupMember;

@Builder
public record GroupJoinResponse(
    Long groupId,
    Long memberId,
    String memberName,
    boolean isAccepted
) {
        public static GroupJoinResponse of(GroupMember groupMember) {
            return GroupJoinResponse.builder()
                    .groupId(groupMember.getGroup().getId())
                    .memberId(groupMember.getMember().getId())
                    .memberName(groupMember.getMember().getNickname())
                    .isAccepted(groupMember.isAccepted())
                    .build();
        }
}
