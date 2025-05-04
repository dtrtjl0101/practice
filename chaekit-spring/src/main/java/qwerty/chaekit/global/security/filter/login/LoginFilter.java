package qwerty.chaekit.global.security.filter.login;

import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import qwerty.chaekit.dto.member.LoginRequest;
import qwerty.chaekit.dto.member.LoginResponse;
import qwerty.chaekit.global.jwt.JwtUtil;
import qwerty.chaekit.global.security.model.CustomUserDetails;
import qwerty.chaekit.global.util.SecurityRequestReader;
import qwerty.chaekit.global.util.SecurityResponseSender;
import qwerty.chaekit.service.member.token.RefreshTokenService;
import qwerty.chaekit.service.util.S3Service;

@Slf4j
public class LoginFilter extends UsernamePasswordAuthenticationFilter {
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final SecurityRequestReader requestReader;
    private final SecurityResponseSender responseSender;
    private final S3Service s3Service;
    private final RefreshTokenService refreshTokenService;

    public LoginFilter(String loginUrl,
                       JwtUtil jwtUtil,
                       AuthenticationManager authManager,
                       SecurityRequestReader reader,
                       SecurityResponseSender sender,
                       S3Service s3Service,
                       RefreshTokenService refreshTokenService
    ) {
        this.jwtUtil = jwtUtil;
        this.authenticationManager = authManager;
        this.requestReader = reader;
        this.responseSender = sender;
        this.s3Service = s3Service;
        this.refreshTokenService = refreshTokenService;

        setAuthenticationManager(authManager);
        setFilterProcessesUrl(loginUrl);
    }

    @Override
    public Authentication attemptAuthentication(
            HttpServletRequest request,
            HttpServletResponse response
    ) throws AuthenticationException {

        LoginRequest loginRequest = requestReader.read(request, LoginRequest.class);
        String email = loginRequest.email();
        String password = loginRequest.password();
        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(email, password, null);

        return authenticationManager.authenticate(authToken);
    }

    @Override
    protected void successfulAuthentication(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain chain, Authentication authentication
    ) {

        CustomUserDetails customUserDetails = (CustomUserDetails) authentication.getPrincipal();
        Long memberId = customUserDetails.member().getId();
        String email = customUserDetails.member().getEmail();
        Long userId;
        Long publisherId;
        String profileImageKey = null;
        if(customUserDetails.user() != null) {
            userId = customUserDetails.user().getId();
            profileImageKey = customUserDetails.user().getProfileImageKey();
        } else {
            userId = null;
        }
        if(customUserDetails.publisher() != null) {
            publisherId = customUserDetails.publisher().getId();
            profileImageKey = customUserDetails.publisher().getProfileImageKey();
        } else {
            publisherId = null;
        }

        String profileImageURL = s3Service.convertToPublicImageURL(profileImageKey);
        String role = customUserDetails.member().getRole().name();

        String refreshToken = refreshTokenService.issueRefreshToken(memberId);
        String accessToken = jwtUtil.createAccessToken(memberId, userId, publisherId, email, role);
        sendSuccessResponse(response, refreshToken, accessToken, memberId, email, userId, publisherId, profileImageURL, role);
    }

    private void sendSuccessResponse(
            HttpServletResponse response,
            String refreshToken,
            String accessToken,
            Long memberId,
            String email,
            Long userId,
            Long publisherId,
            String profileImageURL,
            String role
    ) {
        LoginResponse loginResponse = LoginResponse.builder()
                .refreshToken(refreshToken)
                .accessToken(accessToken)
                .memberId(memberId)
                .email(email)
                .userId(userId)
                .publisherId(publisherId)
                .profileImageURL(profileImageURL)
                .role(role)
                .build();
        responseSender.sendSuccess(response, loginResponse);
    }

    @Override
    protected void unsuccessfulAuthentication(HttpServletRequest request, HttpServletResponse response, AuthenticationException failed) {
        if (failed instanceof BadCredentialsException) {
            responseSender.sendError(response, 401, "BAD_CREDENTIAL", "아이디 또는 비밀번호가 올바르지 않습니다.");
        } else {
            responseSender.sendError(response, 401, "AUTH_FAILED", failed.getMessage());
        }
    }
}
