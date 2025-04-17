package qwerty.chaekit.dto.member;

import lombok.Builder;

@Builder
public record UserJoinResponse(
        Long id,
        Long userId,
        String accessToken,
        String nickname,
        String username
){ }
