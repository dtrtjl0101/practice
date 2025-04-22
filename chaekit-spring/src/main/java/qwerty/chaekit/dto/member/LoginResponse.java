package qwerty.chaekit.dto.member;

import lombok.Builder;

@Builder
public record LoginResponse(
        Long id,
        Long userId,
        Long publisherId,
        String role,
        String accessToken
){ }
