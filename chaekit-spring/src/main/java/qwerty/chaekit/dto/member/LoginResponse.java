package qwerty.chaekit.dto.member;

import lombok.Builder;

@Builder
public record LoginResponse(
        Long id,
        Long profileId,
        String role,
        String accessToken
){ }
