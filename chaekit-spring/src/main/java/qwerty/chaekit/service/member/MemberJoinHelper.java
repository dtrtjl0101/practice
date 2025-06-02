package qwerty.chaekit.service.member;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import qwerty.chaekit.domain.member.Member;
import qwerty.chaekit.domain.member.MemberRepository;
import qwerty.chaekit.domain.member.enums.Role;
import qwerty.chaekit.global.enums.ErrorCode;
import qwerty.chaekit.global.exception.BadRequestException;
import qwerty.chaekit.service.member.verification.EmailVerificationService;
import qwerty.chaekit.service.util.FileService;

@Service
@Transactional
@RequiredArgsConstructor
public class MemberJoinHelper {
    private final MemberRepository memberRepository;
    private final EmailVerificationService emailVerificationService;
    private final BCryptPasswordEncoder bCryptPasswordEncoder;
    private final FileService fileService;

    public Member saveMemberWithVerificationCode(String email, String password, Role role, String verificationCode) {
        validateVerificationCode(email, verificationCode);
        Member savedMember = saveMember(email, password, role);
        emailVerificationService.deleteVerificationCode(email);
        return savedMember;
    }

    public Member saveMember(String email, String password, Role role) {
        validateEmail(email);
        return memberRepository.save(Member.builder()
                .email(email)
                .password(bCryptPasswordEncoder.encode(password))
                .role(role)
                .build());
    }

    public String uploadProfileImage(MultipartFile profileImage) {
        return fileService.uploadProfileImageIfPresent(profileImage);
    }

    public String convertToPublicImageURL(String fileKey) {
        return fileService.convertToPublicImageURL(fileKey);
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
