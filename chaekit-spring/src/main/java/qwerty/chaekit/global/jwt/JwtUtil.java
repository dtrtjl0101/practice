package qwerty.chaekit.global.jwt;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtBuilder;
import io.jsonwebtoken.Jwts;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
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

    public Claims parseJwt(String token) {
        return Jwts.parser().verifyWith(secretKey).build().parseSignedClaims(token).getPayload();
    }

    public Long getMemberId(Claims claims) {
        return claims.get("memberId", Long.class);
    }

    public Long getUserId(Claims claims) {
        return claims.get("userId", Long.class);
    }

    public Long getPublisherId(Claims claims) {
        return claims.get("publisherId", Long.class);
    }

    public String getEmail(Claims claims) {
        return claims.get("email", String.class);
    }

    public String getRole(Claims claims) {
        return claims.get("role", String.class);
    }

    public boolean isValidAccessToken(String token) {
        return isValidToken(token, "access");
    }

    public boolean isValidRefreshToken(String token) {
        return isValidToken(token, "refresh");
    }

    private boolean isValidToken(String token, String type) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(secretKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
            return claims.get("type", String.class).equals(type);
        } catch (ExpiredJwtException e) {
            log.info("token expired");
            return false;
        } catch (Exception e) {
            // 서명 오류, 잘못된 형식, 지원하지 않는 토큰 등
            log.info("token invalid");
            return false;
        }
    }

    public String createAccessToken(Long memberId, Long userId, Long publisherId, String email, String role) {
        return createToken(
                builder -> builder
                        .claim("type", "access")
                        .claim("memberId", memberId)
                        .claim("userId", userId)
                        .claim("publisherId", publisherId)
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
