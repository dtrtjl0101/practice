package qwerty.chaekit.dto.member;

import lombok.Builder;

@Builder
public record UserJoinResponse(
        Long id,
        Long profileId,
        String accessToken,
        String nickname,
        String username,
        String role
){ }
