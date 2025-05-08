package qwerty.chaekit.controller.member;

import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import qwerty.chaekit.dto.member.token.RefreshTokenRequest;
import qwerty.chaekit.dto.member.token.RefreshTokenResponse;
import qwerty.chaekit.global.response.ApiSuccessResponse;
import qwerty.chaekit.service.member.token.RefreshTokenService;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class TokenController {
    private final RefreshTokenService tokenService;

    @Operation(
            summary = "Access Token 재발급",
            description = "Access Token이 만료되었을 때, 유효한 Refresh Token을 통해 새로운 Access Token을 발급받는 API"
    )
    @PostMapping("/token/refresh")
    public ApiSuccessResponse<RefreshTokenResponse> refreshAccessToken(
            @RequestBody @Valid RefreshTokenRequest request
    ) {
        return ApiSuccessResponse.of(tokenService.refreshAccessToken(request));
    }

    @Operation(
            summary = "로그아웃",
            description = "로그아웃 요청 시 기존 Refresh Token을 무효화합니다."
    )
    @PostMapping("/logout")
    public ApiSuccessResponse<Void> logout(
            @RequestBody @Valid RefreshTokenRequest request
    ) {
        tokenService.logout(request);
        return ApiSuccessResponse.emptyResponse();
    }

}
