package qwerty.chaekit.dto.member;

import jakarta.validation.constraints.NotBlank;

public record UserJoinRequest(
        @NotBlank
        String nickname,
        @NotBlank
        String username,
        @NotBlank
        String password
){ }
