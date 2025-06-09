package qwerty.chaekit.global.config.swagger;

import io.swagger.v3.oas.annotations.Operation;
import org.springframework.web.bind.annotation.*;
import qwerty.chaekit.dto.member.LoginRequest;
import qwerty.chaekit.dto.member.LoginResponse;
import qwerty.chaekit.global.response.ApiSuccessResponse;

@RestController(value = "LoginController")
public class LoginFilterController {
    @Operation(summary = "이메일 인증 로그인", description = "Spring Security가 처리하는 이메일 인증 로그인 API")
    @PostMapping("/api/login")
    public ApiSuccessResponse<LoginResponse> login(@RequestBody LoginRequest loginRequest) {
        // This endpoint is only for Swagger documentation and should not be invoked.
        throw new UnsupportedOperationException("This endpoint is not implemented. It is only for Swagger documentation.");
    }

    @Operation(summary = "Google OAuth2 로그인", 
            description = """
                    Spring Security가 처리하는 Google OAuth2 로그인 API.
                    성공 시, {baseUrl}/oauth2/success?accessToken={accessToken}&refreshToken={refreshToken} 으로 리다이렉트됩니다.
                    실패 시, {baseUrl}/oauth2/failure?error={error} 으로 리다이렉트됩니다.
                    baseUrl은 application.properties의 kakao.pay.redirect-base-url로 설정된 값입니다.""")
    @GetMapping("/oauth2/authorization/google")
    public void oauth2Login() {
        // This endpoint is only for Swagger documentation and should not be invoked.
        throw new UnsupportedOperationException("This endpoint is not implemented. It is only for Swagger documentation.");
    }
}