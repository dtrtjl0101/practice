package qwerty.chaekit.dto.member;


import jakarta.validation.constraints.NotBlank;

public record PublisherJoinRequest(
        @NotBlank
        String publisherName,
        @NotBlank
        String username,
        @NotBlank
        String password
){ }
