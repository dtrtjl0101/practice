package qwerty.chaekit.service.member.user;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import qwerty.chaekit.domain.ebook.credit.wallet.CreditWallet;
import qwerty.chaekit.domain.ebook.credit.wallet.CreditWalletRepository;
import qwerty.chaekit.domain.member.Member;
import qwerty.chaekit.domain.member.enums.Role;
import qwerty.chaekit.domain.member.user.UserProfile;
import qwerty.chaekit.domain.member.user.UserProfileRepository;
import qwerty.chaekit.dto.member.LoginResponse;
import qwerty.chaekit.dto.member.UserJoinRequest;
import qwerty.chaekit.global.enums.ErrorCode;
import qwerty.chaekit.global.exception.BadRequestException;
import qwerty.chaekit.global.jwt.JwtUtil;
import qwerty.chaekit.service.member.MemberJoinHelper;
import qwerty.chaekit.service.member.token.RefreshTokenService;

@Service
@Transactional
@RequiredArgsConstructor
public class UserJoinService {
    private final MemberJoinHelper memberJoinHelper;
    private final UserProfileRepository userRepository;
    private final JwtUtil jwtUtil;
    private final RefreshTokenService refreshTokenService;
    private final CreditWalletRepository creditWalletRepository;

    @Transactional
    public LoginResponse join(UserJoinRequest request) {
        String email = request.email();
        String password = request.password();
        String verificationCode = request.verificationCode();

        String imageFileKey = memberJoinHelper.uploadProfileImage(request.profileImage());

        validateNickname(request.nickname());
        Member member = memberJoinHelper.saveMemberWithVerificationCode(email, password, Role.ROLE_USER, verificationCode);
        UserProfile user = saveUser(request, member, imageFileKey);
        saveCreditWallet(user);

        return toResponse(member, user);
    }

    private void validateNickname(String nickname) {
        if (userRepository.existsByNickname(nickname)) {
            throw new BadRequestException(ErrorCode.NICKNAME_ALREADY_EXISTS);
        }
    }

    private UserProfile saveUser(UserJoinRequest request, Member member, String imageFileKey) {
        return userRepository.save(UserProfile.builder()
                .member(member)
                .nickname(request.nickname())
                .profileImageKey(imageFileKey)
                .build());
    }

    private void saveCreditWallet(UserProfile userProfile) {
        creditWalletRepository.save(
                CreditWallet.builder()
                        .user(userProfile)
                        .build()
        );
    }

    private LoginResponse toResponse(Member member, UserProfile user) {
        String accessToken = jwtUtil.createAccessToken(
                member.getId(),
                user.getId(),
                member.getEmail(),
                member.getRole().name()
        );
        String refreshToken = refreshTokenService.issueRefreshToken(member.getId());
        String profileImageKey = memberJoinHelper.convertToPublicImageURL(user.getProfileImageKey());

        return LoginResponse.builder()
                .memberId(member.getId())
                .userId(user.getId())
                .refreshToken(refreshToken)
                .accessToken(accessToken)
                .email(member.getEmail())
                .nickname(user.getNickname())
                .profileImageURL(profileImageKey)
                .role(Role.ROLE_USER)
                .firstPaymentBenefit(true)
                .build();
    }
}
