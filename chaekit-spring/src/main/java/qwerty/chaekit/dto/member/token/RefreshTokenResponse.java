package qwerty.chaekit.dto.member.token;

import lombok.Builder;

@Builder
public record RefreshTokenResponse(
        String refreshToken,
        String accessToken
) { }
