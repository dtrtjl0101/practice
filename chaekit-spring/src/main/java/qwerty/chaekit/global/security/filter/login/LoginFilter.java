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
import qwerty.chaekit.global.security.util.LoginResponseFactory;
import qwerty.chaekit.global.util.SecurityRequestReader;
import qwerty.chaekit.global.util.SecurityResponseSender;
import qwerty.chaekit.service.member.token.RefreshTokenService;
import qwerty.chaekit.service.util.FileService;

@Slf4j
public class LoginFilter extends UsernamePasswordAuthenticationFilter {
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final SecurityRequestReader requestReader;
    private final SecurityResponseSender responseSender;
    private final FileService fileService;
    private final RefreshTokenService refreshTokenService;
    private final LoginResponseFactory loginResponseFactory;

    public LoginFilter(String loginUrl,
                       JwtUtil jwtUtil,
                       AuthenticationManager authManager,
                       SecurityRequestReader reader,
                       SecurityResponseSender sender,
                       FileService fileService,
                       RefreshTokenService refreshTokenService,
                       LoginResponseFactory loginResponseFactory
    ) {
        this.jwtUtil = jwtUtil;
        this.authenticationManager = authManager;
        this.requestReader = reader;
        this.responseSender = sender;
        this.fileService = fileService;
        this.refreshTokenService = refreshTokenService;
        this.loginResponseFactory = loginResponseFactory;

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
        LoginResponse loginResponse = loginResponseFactory.createLoginResponse(customUserDetails);
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
