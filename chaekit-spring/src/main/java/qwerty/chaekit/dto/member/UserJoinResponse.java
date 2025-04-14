package qwerty.chaekit.dto.member;

import lombok.Builder;

@Builder
public record UserJoinResponse(
        Long id,
        String accessToken,
        String nickname,
        String username,
        String role
){ }
