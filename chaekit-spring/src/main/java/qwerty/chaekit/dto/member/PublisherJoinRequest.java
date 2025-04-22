package qwerty.chaekit.dto.member;


import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record PublisherJoinRequest(
        @NotBlank
        String publisherName,
        @Email
        String email,
        @NotBlank
        String password,
        @NotBlank
        String verificationCode
){ }
