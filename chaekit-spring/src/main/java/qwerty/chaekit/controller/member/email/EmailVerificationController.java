package qwerty.chaekit.controller.member.email;

import jakarta.validation.constraints.Email;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import qwerty.chaekit.global.enums.ErrorCode;
import qwerty.chaekit.global.exception.BadRequestException;
import qwerty.chaekit.global.response.ApiSuccessResponse;
import qwerty.chaekit.service.member.email.EmailVerificationService;
import qwerty.chaekit.service.member.notification.EmailService;

@Slf4j
@RestController
@RequestMapping("/api/email-verification")
@RequiredArgsConstructor
public class EmailVerificationController {
    private final EmailVerificationService emailVerificationService;
    private final EmailService emailService;

    // TODO: 서비스 로직 분리 필요
    // 이메일로 인증 코드 전송
    @PostMapping("/send-verification-code")
    public ApiSuccessResponse<String> sendVerificationCode(@RequestParam String email) {
        // 인증 코드 생성 (단순히 6자리 숫자로 예시)
        String verificationCode = generateVerificationCode();

        // Redis에 인증 코드 저장 (10분 유효)
        emailVerificationService.saveVerificationCode(email, verificationCode);

        // 이메일로 인증 코드 발송 (여기서는 코드만 반환, TODO: 링크 만들어서 보내는 로직 필요)
        try {
            emailService.sendVerificationEmail(email, verificationCode);
        } catch (Exception e) {
            log.error(e.getMessage(), e);
            throw new BadRequestException(ErrorCode.EMAIL_SEND_FAILED);
        }
        return ApiSuccessResponse.of("[테스트] 이메일: " + email + ". 다음과 같은 코드가 왔다고 가정: " + verificationCode);
    }

    // 이메일 인증 코드 검증
    @PostMapping("/verify-code")
    public ApiSuccessResponse<String> verifyCode(@RequestParam @Email String email, @RequestParam String code) {
        // 인증 코드 검증
        boolean isVerified = emailVerificationService.verifyCode(email, code);

        if (isVerified) {
            return ApiSuccessResponse.of("테스트: 인증 성공");
        } else {
            throw new BadRequestException(ErrorCode.EMAIL_VERIFICATION_FAILED);
        }
    }

    // 임의의 6자리 인증 코드 생성
    private String generateVerificationCode() {
        int code = (int) (Math.random() * 900000) + 100000;  // 6자리*
        return String.valueOf(code);
    }
}