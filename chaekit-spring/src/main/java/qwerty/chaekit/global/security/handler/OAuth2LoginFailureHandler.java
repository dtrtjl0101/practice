package qwerty.chaekit.global.security.handler;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;
import qwerty.chaekit.global.properties.KakaoPayProperties;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class OAuth2LoginFailureHandler implements AuthenticationFailureHandler {
    private final KakaoPayProperties kakaoPayProperties;
    
    @Override
    public void onAuthenticationFailure(HttpServletRequest request,
                                        HttpServletResponse response,
                                        AuthenticationException exception) throws IOException {
        String redirectUrl = UriComponentsBuilder.fromUriString(kakaoPayProperties.redirectBaseUrl() + "/oauth2/failure")
                .queryParam("error", exception.getMessage())
                .build()
                .toUriString();

        response.sendRedirect(redirectUrl);
    }
}