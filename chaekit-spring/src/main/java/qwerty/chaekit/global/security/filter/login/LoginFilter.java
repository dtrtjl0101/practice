package qwerty.chaekit.global.security.filter.login;

import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import qwerty.chaekit.global.security.model.CustomUserDetails;
import qwerty.chaekit.dto.LoginRequest;
import qwerty.chaekit.global.jwt.JwtUtil;
import qwerty.chaekit.global.util.SecurityRequestReader;
import qwerty.chaekit.global.util.SecurityResponseSender;

import java.io.IOException;
import java.util.Collection;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@RequiredArgsConstructor
public class LoginFilter extends UsernamePasswordAuthenticationFilter {
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final SecurityRequestReader requestReader;
    private final SecurityResponseSender responseSender;

    @Value("${spring.jwt.expiration}")
    private Long jwtExpirationMs;

    @Override
    public Authentication attemptAuthentication(HttpServletRequest request, HttpServletResponse response) throws AuthenticationException {
        LoginRequest loginRequest = requestReader.read(request, LoginRequest.class);
        String username = loginRequest.username();
        String password = loginRequest.password();
        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(username, password, null);

        return authenticationManager.authenticate(authToken);
    }

    @Override
    protected void successfulAuthentication(HttpServletRequest request, HttpServletResponse response,
                                            FilterChain chain, Authentication authentication) {

        CustomUserDetails customUserDetails = (CustomUserDetails) authentication.getPrincipal();
        String username = customUserDetails.getUsername();

        Collection<? extends GrantedAuthority> authorities = authentication.getAuthorities();
        authorities.stream().findFirst().map(GrantedAuthority::getAuthority).ifPresentOrElse(
                (role)->{
                    String token = jwtUtil.createJwt(username, role, jwtExpirationMs);
                    try {
                        sendSuccessResponse(response, token, username);
                    } catch (IOException e) {
                        throw new RuntimeException(e);
                    }
                }, ()-> responseSender.sendError(response, 500, "INVALID_ROLE", "권한 정보가 존재하지 않습니다.")
        );
    }

    private void sendSuccessResponse(HttpServletResponse response, String token, String username) throws IOException {
        response.setHeader("Authorization", "Bearer " + token);
        Map<String, Object> responseData = new HashMap<>();
        responseData.put("username", username);
        responseSender.sendSuccess(response, responseData);
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
