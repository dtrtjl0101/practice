package qwerty.chaekit.dto.group.response;

import lombok.Builder;
import qwerty.chaekit.domain.group.groupmember.GroupMember;

import java.time.LocalDateTime;

@Builder
public record GroupMemberResponse(
        Long userId,
        String nickname,
        String profileImageURL,
        LocalDateTime createdAt,
        LocalDateTime approvedAt
) {
    public static GroupMemberResponse of(GroupMember groupMember, String imageUrl) {
        return GroupMemberResponse.builder()
                .userId(groupMember.getUser().getId())
                .nickname(groupMember.getUser().getNickname())
                .profileImageURL(imageUrl)
                .createdAt(groupMember.getCreatedAt())
                .approvedAt(groupMember.getApprovedAt())
                .build();
    }
}
