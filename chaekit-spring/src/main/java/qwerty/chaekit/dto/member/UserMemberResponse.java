package qwerty.chaekit.dto.member;

import lombok.Builder;

@Builder
public record UserMemberResponse(
        Long id,
        Long profileId,
        String username,
        String nickname,
        String role
){ }
