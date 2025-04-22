package qwerty.chaekit.dto.member;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record UserJoinRequest(
        @NotBlank
        String nickname,
        @Email
        String email,
        @NotBlank
        String password,
        @NotBlank
        String verificationCode
){ }
