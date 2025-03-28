package qwerty.chaekit.dto;

import lombok.Builder;

@Builder
public record UserMyInfoResponse(
        Long id,
        String nickname,
        String username,
        String role
){ }
