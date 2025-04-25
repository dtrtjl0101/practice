package qwerty.chaekit.dto.member;

import lombok.Builder;

@Builder
public record LoginResponse(
        Long memberId,
        String email,
        Long userId,
        Long publisherId,
        String role,
        String profileImageURL,
        String accessToken
){ }
