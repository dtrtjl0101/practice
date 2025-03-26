package qwerty.chaekit.dto;

import lombok.Builder;

@Builder
public record UserMyInfoResponse(
        String nickname,
        String username,
        String role
){ }
