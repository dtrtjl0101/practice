package qwerty.chaekit.global.jwt;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtBuilder;
import io.jsonwebtoken.Jwts;
import jakarta.annotation.Nullable;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import qwerty.chaekit.domain.member.Member;
import qwerty.chaekit.domain.member.user.UserProfile;
import qwerty.chaekit.global.properties.JwtProperties;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.function.UnaryOperator;

@Slf4j
@Component
public class JwtUtil {
    private final SecretKey secretKey;
    private final JwtProperties jwtProperties;

    public JwtUtil(JwtProperties jwtProperties) {
        this.jwtProperties = jwtProperties;
        this.secretKey = new SecretKeySpec(
                jwtProperties.secret().getBytes(StandardCharsets.UTF_8),
                Jwts.SIG.HS256.key().build().getAlgorithm()
        );
    }

    public TokenParsingResult parseAccessToken(String token) {
        return parseToken(token, "access");
    }

    public TokenParsingResult parseRefreshToken(String token) {
        return parseToken(token, "refresh");
    }

    public TokenParsingResult parseToken(String token, String expectedType) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(secretKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            if (!claims.get("type", String.class).equals(expectedType)) {
                return TokenParsingResult.of(TokenStatus.INVALID);
            }

            return TokenParsingResult.of(TokenStatus.VALID, claims);

        } catch (ExpiredJwtException e) {
            return TokenParsingResult.of(TokenStatus.EXPIRED);
        } catch (Exception e) {
            return TokenParsingResult.of(TokenStatus.INVALID);
        }
    }
    public String createAccessToken(
            Member member,
            @Nullable UserProfile user
    ) {
        Long userId = user != null ? user.getId() : null;
        //Long publisherId = publisher != null ? publisher.getId() : null;
        return createAccessToken(member.getId(), userId, member.getEmail(), member.getRole().name());
    }

    public String createAccessToken(Long memberId, Long userId, String email, String role) {
        return createToken(
                builder -> builder
                        .claim("type", "access")
                        .claim("memberId", memberId)
                        .claim("userId", userId)
                        .claim("email", email)
                        .claim("role", role),
                jwtProperties.expirationMs()
        );
    }

    public String createRefreshToken(Long memberId) {
        return createToken(
                builder -> builder
                        .claim("type", "refresh")
                        .claim("memberId", memberId),
                jwtProperties.refreshExpirationMs()
        );
    }

    private String createToken(UnaryOperator<JwtBuilder> claimSetter, long expirationMs) {
        JwtBuilder builder = Jwts.builder();
        builder = claimSetter.apply(builder);
        return builder
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + expirationMs))
                .signWith(secretKey)
                .compact();
    }

}
