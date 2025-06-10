package qwerty.chaekit.global.security.handler;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;
import qwerty.chaekit.dto.member.LoginResponse;
import qwerty.chaekit.global.properties.KakaoPayProperties;
import qwerty.chaekit.global.security.model.CustomUserDetails;
import qwerty.chaekit.global.security.util.LoginResponseFactory;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {
    private final LoginResponseFactory loginResponseFactory;
    private final KakaoPayProperties kakaoPayProperties;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        CustomUserDetails customUserDetails = (CustomUserDetails) authentication.getPrincipal();
        LoginResponse loginResponse = loginResponseFactory.createLoginResponse(customUserDetails);
        String redirectUrl = UriComponentsBuilder.fromUriString(kakaoPayProperties.redirectBaseUrl() + "/oauth2/success")
                .queryParam("accessToken", loginResponse.accessToken())
                .queryParam("refreshToken", loginResponse.refreshToken())
                .build()
                .toUriString();
        response.sendRedirect(redirectUrl);
    }
}
