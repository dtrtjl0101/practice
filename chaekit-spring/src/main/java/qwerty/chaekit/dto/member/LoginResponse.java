package qwerty.chaekit.dto.member;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;

@Builder
public record LoginResponse(
        @Schema(description = "회원 고유 ID", example = "1")
        @NotNull
        Long memberId,

        @Schema(description = "회원 이메일", example = "user@example.com")
        @NotNull
        String email,

        // User
        @Schema(description = "일반 사용자 ID", example = "1")
        Long userId,

        @Schema(description = "닉네임", example = "booklover")
        String nickname,

        // Publisher
        @Schema(description = "출판사 ID", example = "1")
        Long publisherId,

        @Schema(description = "출판사 이름", example = "문학과지성사")
        String publisherName,

        // Common
        @Schema(description = "프로필 이미지 URL", example = "https://cdn.example.com/images/profile1.png")
        String profileImageURL,

        @Schema(description = "회원 역할", example = "ROLE_USER")
        @NotNull
        String role,

        @Schema(description = "Refresh Token (재발급용)", example = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
        @NotNull
        String refreshToken,

        @Schema(description = "Access Token (API 인증용)", example = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
        @NotNull
        String accessToken
) {}