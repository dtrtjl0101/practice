package qwerty.chaekit.global.security.handler;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;
import qwerty.chaekit.global.util.SecurityResponseSender;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class CustomAuthenticationEntryPoint implements AuthenticationEntryPoint {
    private final SecurityResponseSender responder;

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
                         AuthenticationException authException) throws IOException {
        responder.sendError(response, HttpServletResponse.SC_UNAUTHORIZED, "UNAUTHORIZED", "로그인이 필요합니다.");
    }
}