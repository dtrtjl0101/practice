package qwerty.chaekit.service.member;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import qwerty.chaekit.domain.member.Member;
import qwerty.chaekit.domain.member.enums.Role;
import qwerty.chaekit.domain.member.MemberRepository;
import qwerty.chaekit.global.enums.ErrorCode;
import qwerty.chaekit.global.exception.BadRequestException;
import qwerty.chaekit.service.member.email.EmailVerificationService;

@Service
@RequiredArgsConstructor
public class MemberJoinHelper {
    private final MemberRepository memberRepository;
    private final EmailVerificationService emailVerificationService;
    private final BCryptPasswordEncoder bCryptPasswordEncoder;

    public Member saveMember(String email, String password, Role role) {
        validateEmail(email);
        return memberRepository.save(Member.builder()
                .email(email)
                .password(bCryptPasswordEncoder.encode(password))
                .role(role)
                .build());
    }

    public Member saveMemberWithVerificationCode(String email, String password, Role role, String verificationCode) {
        validateVerificationCode(email, verificationCode);
        Member savedMember = saveMember(email, password, role);
        emailVerificationService.deleteVerificationCode(email);
        return savedMember;
    }

    private void validateEmail(String email) {
        if (memberRepository.existsByEmail(email)) {
            throw new BadRequestException(ErrorCode.MEMBER_ALREADY_EXISTS);
        }
    }
    private void validateVerificationCode(String email, String verificationCode) {
        if (!emailVerificationService.verifyCode(email, verificationCode)) {
            throw new BadRequestException(ErrorCode.EMAIL_VERIFICATION_FAILED);
        }
    }
}
