package qwerty.chaekit.dto.member;


import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.web.multipart.MultipartFile;

public record PublisherJoinRequest(
        @NotBlank
        String publisherName,
        @NotBlank
        @Email
        String email,
        @NotBlank
        String password,
        MultipartFile profileImage,
        @NotBlank
        String verificationCode
){ }
