package qwerty.chaekit.global.security.filter;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
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
import qwerty.chaekit.global.util.SecurityResponseSender;

import java.io.IOException;
import java.util.Collection;
import java.util.HashMap;
import java.util.Map;

@RequiredArgsConstructor
public class LoginFilter extends UsernamePasswordAuthenticationFilter {

    @Value("${spring.jwt.expiration}")
    private final Long jwtExpirationMs;
    private final ObjectMapper objectMapper;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final SecurityResponseSender responseSender;


    @Override
    public Authentication attemptAuthentication(HttpServletRequest request, HttpServletResponse response) throws AuthenticationException {
        try {
            LoginRequest loginRequest = objectMapper.readValue(request.getInputStream(), LoginRequest.class);
            String username = loginRequest.username();
            String password = loginRequest.password();
            UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(username, password, null);

            return authenticationManager.authenticate(authToken);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    protected void successfulAuthentication(HttpServletRequest request, HttpServletResponse response,
                                            FilterChain chain, Authentication authentication) throws IOException {

        CustomUserDetails customUserDetails = (CustomUserDetails) authentication.getPrincipal();
        String username = customUserDetails.getUsername();

        Collection<? extends GrantedAuthority> authorities = authentication.getAuthorities();
        String role = authorities.stream().findFirst().map(GrantedAuthority::getAuthority).orElse("ROLE_USER");

        String token = jwtUtil.createJwt(username, role, jwtExpirationMs);
        sendSuccessResponse(response, token, username);
    }

    private void sendSuccessResponse(HttpServletResponse response, String token, String username) throws IOException {
        response.setHeader("Authorization", "Bearer " + token);
        Map<String, Object> responseData = new HashMap<>();
        responseData.put("username", username);
        responseSender.sendSuccess(response, responseData);
    }

    @Override
    protected void unsuccessfulAuthentication(HttpServletRequest request, HttpServletResponse response, AuthenticationException failed) throws IOException {
        if (failed instanceof BadCredentialsException) {
            responseSender.sendError(response, 401, "BAD_CREDENTIAL", "아이디 또는 비밀번호가 올바르지 않습니다.");
        } else {
            responseSender.sendError(response, 401, "AUTH_FAILED", failed.getMessage());
        }
    }
}
