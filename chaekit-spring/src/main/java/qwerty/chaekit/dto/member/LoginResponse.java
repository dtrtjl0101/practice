package qwerty.chaekit.dto.member;

import lombok.Builder;

@Builder
public record LoginResponse(
        Long id,
        String role,
        String accessToken
){ }
