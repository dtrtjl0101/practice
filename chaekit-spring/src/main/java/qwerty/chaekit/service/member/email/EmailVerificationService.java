package qwerty.chaekit.service.member.email;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class EmailVerificationService {
    private final RedisTemplate<String, String> redisTemplate;

    public void saveVerificationCode(String email, String verificationCode) {
        // 이메일과 인증 코드를 Redis에 저장
        redisTemplate.opsForValue().set(email, verificationCode, 30, TimeUnit.MINUTES);  // 10분 후 만료
    }

    public boolean verifyCode(String email, String code) {
        // Redis에서 이메일 인증 코드 조회
        String storedCode = redisTemplate.opsForValue().get(email);
        return storedCode != null && storedCode.equals(code);
    }
    public void deleteVerificationCode(String email) {
        // Redis에서 이메일 인증 코드 삭제(TODO: 실제 회원가입 완료 시 호출)
        redisTemplate.delete(email);
    }
}