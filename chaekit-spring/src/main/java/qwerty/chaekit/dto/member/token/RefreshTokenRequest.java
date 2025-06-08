package qwerty.chaekit.dto.member.token;

import jakarta.validation.constraints.NotNull;

public record RefreshTokenRequest(
        @NotNull
        String refreshToken
) {
}
