package qwerty.chaekit.dto.member;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @NotBlank
        String email,
        @NotBlank
        String password
){ }
