package qwerty.chaekit.global.config.swagger;

import io.swagger.v3.oas.annotations.Operation;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import qwerty.chaekit.dto.member.LoginRequest;
import qwerty.chaekit.dto.member.LoginResponse;
import qwerty.chaekit.global.response.ApiSuccessResponse;

@RestController(value = "LoginController")
@RequestMapping("/api/login")
public class LoginFilterController {
    @Operation(summary = "로그인", description = "Spring Security가 처리하는 로그인 API")
    @PostMapping
    public ApiSuccessResponse<LoginResponse> login(@RequestBody LoginRequest loginRequest) {
        // This endpoint is only for Swagger documentation and should not be invoked.
        throw new UnsupportedOperationException("This endpoint is not implemented. It is only for Swagger documentation.");
    }
}