package qwerty.chaekit.dto.member;

import lombok.Builder;

@Builder
public record UserJoinResponse(
        Long memberId,
        String email,
        Long userId,
        String accessToken,
        String nickname,
        String profileImageURL
){ }
