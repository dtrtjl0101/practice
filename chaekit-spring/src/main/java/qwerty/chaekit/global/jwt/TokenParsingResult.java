package qwerty.chaekit.global.jwt;

import io.jsonwebtoken.Claims;

public record TokenParsingResult(
        TokenStatus status,
        Long memberId,
        Long userId,
        String email,
        String role
) {
    public static TokenParsingResult of(TokenStatus status, Claims claims) {
        return new TokenParsingResult(status,
                claims.get("memberId", Long.class),
                claims.get("userId", Long.class),
                claims.get("email", String.class),
                claims.get("role", String.class));
    }

    public static TokenParsingResult of(TokenStatus status) {
        return new TokenParsingResult(status, null, null, null,  null);
    }

    public static TokenParsingResult of(TokenStatus status, Long memberId, Long userId, String email, String role) {
        return new TokenParsingResult(status, memberId, userId, email, role);
    }

    public String getStatus() {
        return this.status.name();
    }

    public boolean isExpired() {
        return this.status == TokenStatus.EXPIRED;
    }

    public boolean isValid() {
        return this.status == TokenStatus.VALID;
    }
}
