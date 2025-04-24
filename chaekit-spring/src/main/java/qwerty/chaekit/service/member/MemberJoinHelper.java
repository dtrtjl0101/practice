package qwerty.chaekit.service.member;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import qwerty.chaekit.domain.member.Member;
import qwerty.chaekit.domain.member.MemberRepository;
import qwerty.chaekit.domain.member.enums.Role;
import qwerty.chaekit.global.enums.ErrorCode;
import qwerty.chaekit.global.enums.S3Directory;
import qwerty.chaekit.global.exception.BadRequestException;
import qwerty.chaekit.global.properties.AwsProperties;
import qwerty.chaekit.service.member.email.EmailVerificationService;
import qwerty.chaekit.service.util.S3Service;

@Service
@RequiredArgsConstructor
public class MemberJoinHelper {
    private final MemberRepository memberRepository;
    private final EmailVerificationService emailVerificationService;
    private final BCryptPasswordEncoder bCryptPasswordEncoder;
    private final S3Service s3Service;
    private final AwsProperties awsProperties;

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
        try{
            return s3Service.uploadFile(awsProperties.imageBucketName(), S3Directory.PROFILE_IMAGE, profileImage);
        } catch (BadRequestException e) {
            if(!e.getErrorCode().equals(ErrorCode.FILE_MISSING.getCode()))
                throw e;
            return null;
        }
    }

    public String convertToPublicImageURL(String fileKey) {
        return s3Service.convertToPublicImageURL(fileKey);
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
