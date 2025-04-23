package qwerty.chaekit.dto.member;

import lombok.Builder;

@Builder
public record UserJoinResponse(
        Long memberId,
        Long userId,
        String accessToken,
        String nickname,
        String email,
        String profileImageURL
){ }
