package qwerty.chaekit.dto.group.response;

import lombok.Builder;
import qwerty.chaekit.domain.group.groupmember.GroupMember;

import java.time.LocalDateTime;

@Builder
public record GroupPendingMemberResponse(
        Long userId,
        String nickname,
        String profileImageURL,
        LocalDateTime createdAt
) {
    public static GroupPendingMemberResponse of(GroupMember groupMember, String profileImageURL) {
        return GroupPendingMemberResponse.builder()
                .userId(groupMember.getUser().getId())
                .nickname(groupMember.getUser().getNickname())
                .profileImageURL(profileImageURL)
                .createdAt(groupMember.getCreatedAt())
                .build();
    }
}
