package qwerty.chaekit.service.member.email;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import qwerty.chaekit.global.enums.ErrorCode;
import qwerty.chaekit.global.exception.BadRequestException;
import qwerty.chaekit.service.member.notification.EmailService;

import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class EmailVerificationService {
    private final RedisTemplate<String, String> redisTemplate;
    private final EmailService emailService;

    public String sendVerificationCode(String email) {
        String verificationCode = generateVerificationCode();
        // Redis에 인증 코드 저장 (30분 유효)
        redisTemplate.opsForValue().set(email, verificationCode, 30, TimeUnit.MINUTES);  // 10분 후 만료
        // 이메일로 인증 코드 발송
        emailService.sendVerificationEmail(email, verificationCode);
        return "[테스트용 응답] 이메일: " + email + ", 코드: " + verificationCode;
    }

    public String processVerification(String email, String code) {
        if(verifyCode(email, code)) {
            return "테스트: 인증 성공";
        } else {
            throw new BadRequestException(ErrorCode.EMAIL_VERIFICATION_FAILED);
        }
    }

    public boolean verifyCode(String email, String code) {
        // Redis에서 이메일 인증 코드 조회
        String storedCode = redisTemplate.opsForValue().get(email);
        return storedCode != null && storedCode.equals(code);
    }
    public void deleteVerificationCode(String email) {
        redisTemplate.delete(email);
    }

    // 임의의 6자리 인증 코드 생성
    private String generateVerificationCode() {
        int code = (int) (Math.random() * 900000) + 100000;  // 6자리*
        return String.valueOf(code);
    }
}