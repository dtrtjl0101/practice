package qwerty.chaekit.dto;

import lombok.Builder;

@Builder
public record UserJoinResponse(
        String nickname,
        String username,
        String role
){ }
