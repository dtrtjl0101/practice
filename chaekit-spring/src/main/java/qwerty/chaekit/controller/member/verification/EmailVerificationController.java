package qwerty.chaekit.controller.member.verification;

import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.constraints.Email;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import qwerty.chaekit.global.response.ApiSuccessResponse;
import qwerty.chaekit.service.member.verification.EmailVerificationService;

@Slf4j
@RestController
@RequestMapping("/api/email-verification")
@RequiredArgsConstructor
public class EmailVerificationController {
    private final EmailVerificationService emailVerificationService;

    @Operation(
            summary = "인증 코드 발송",
            description = "이메일로 인증 코드를 생성하여 발송하는 API입니다. 생성된 인증 코드는 Redis에 저장되며, 유효 기간은 30분입니다."
    )
    @PostMapping("/send-verification-code")
    public ApiSuccessResponse<String> sendVerificationCode(@RequestParam @Email String email) {
        return ApiSuccessResponse.of(emailVerificationService.sendVerificationCode(email));
    }

    @Operation(
            summary = "인증 코드 검증",
            description = "사용자가 입력한 인증 코드를 검증합니다. 올바른 코드일 경우 인증 성공 메시지를 반환하고, 실패하면 400 에러를 반환합니다."
    )
    @GetMapping("/verify-code")
    public ApiSuccessResponse<String> verifyCode(@RequestParam @Email String email, @RequestParam String verificationCode) {
        return ApiSuccessResponse.of(emailVerificationService.processVerification(email, verificationCode));
    }
}