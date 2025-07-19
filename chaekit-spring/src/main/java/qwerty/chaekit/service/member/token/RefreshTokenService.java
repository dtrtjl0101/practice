package qwerty.chaekit.service.member.token;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import qwerty.chaekit.domain.member.Member;
import qwerty.chaekit.domain.member.MemberRepository;
//import qwerty.chaekit.domain.member.publisher.PublisherProfile;
//import qwerty.chaekit.domain.member.publisher.PublisherProfileRepository;
import qwerty.chaekit.domain.member.user.UserProfile;
import qwerty.chaekit.domain.member.user.UserProfileRepository;
import qwerty.chaekit.dto.member.token.RefreshTokenRequest;
import qwerty.chaekit.dto.member.token.RefreshTokenResponse;
import qwerty.chaekit.global.enums.ErrorCode;
import qwerty.chaekit.global.exception.NotFoundException;
import qwerty.chaekit.global.exception.UnauthorizedException;
import qwerty.chaekit.global.jwt.JwtUtil;
import qwerty.chaekit.global.jwt.TokenParsingResult;
import qwerty.chaekit.global.properties.JwtProperties;

import java.time.Duration;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class RefreshTokenService {
    private final MemberRepository memberRepository;
    private final JwtUtil jwtUtil;
    private final UserProfileRepository userProfileRepository;
    //private final PublisherProfileRepository publisherProfileRepository;
    private final RedisTemplate<String, String> redisTemplate;
    private final JwtProperties jwtProperties;

    public RefreshTokenResponse refreshAccessToken(RefreshTokenRequest request) {
        String refreshToken = request.refreshToken();
        TokenParsingResult parsedToken = jwtUtil.parseRefreshToken(refreshToken);

        if (parsedToken.isExpired()) {
            throw new UnauthorizedException(ErrorCode.EXPIRED_REFRESH_TOKEN);
        }

        if (!parsedToken.isValid()) {
            throw new UnauthorizedException(ErrorCode.INVALID_REFRESH_TOKEN);
        }

        if(!redisTemplate.hasKey("refresh:" + refreshToken)) {
            throw new UnauthorizedException(ErrorCode.INVALID_REFRESH_TOKEN);
        }

        Long memberId = parsedToken.memberId();
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new NotFoundException(ErrorCode.MEMBER_NOT_FOUND));
        UserProfile user = userProfileRepository.findByMember_Id(memberId).orElse(null);
        //PublisherProfile publisher = publisherProfileRepository.findByMember_Id(memberId).orElse(null);

        String newAccessToken = jwtUtil.createAccessToken(member, user);

        return RefreshTokenResponse.builder()
                .accessToken(newAccessToken)
                .build();
    }

    public void logout(RefreshTokenRequest request) {
        deleteRefreshToken(request.refreshToken());
    }

    public String issueRefreshToken(Long memberId) {
        String refreshToken = jwtUtil.createRefreshToken(memberId);
        saveRefreshToken(refreshToken);
        return refreshToken;
    }

    public void saveRefreshToken(String refreshToken) {
        String key = "refresh:" + refreshToken;
        redisTemplate.opsForValue().set(key, refreshToken, Duration.ofMillis(jwtProperties.refreshExpirationMs() + 1000));
    }

    public void deleteRefreshToken(String refreshToken) {
        String key = "refresh:" + refreshToken;
        redisTemplate.delete(key);
    }
}
