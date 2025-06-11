package qwerty.chaekit.global.security.util;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import qwerty.chaekit.domain.ebook.credit.wallet.CreditWalletRepository;
import qwerty.chaekit.domain.member.Member;
import qwerty.chaekit.domain.member.enums.Role;
import qwerty.chaekit.domain.member.publisher.PublisherProfile;
import qwerty.chaekit.domain.member.user.UserProfile;
import qwerty.chaekit.dto.member.LoginResponse;
import qwerty.chaekit.global.jwt.JwtUtil;
import qwerty.chaekit.global.security.model.CustomUserDetails;
import qwerty.chaekit.service.member.token.RefreshTokenService;
import qwerty.chaekit.service.util.FileService;

@Component
@RequiredArgsConstructor
public class LoginResponseFactory {
    private final JwtUtil jwtUtil;
    private final RefreshTokenService refreshTokenService;
    private final FileService fileService;
    private final CreditWalletRepository creditWalletRepository;

    public LoginResponse createLoginResponse(CustomUserDetails customUserDetails) {
        Member member = customUserDetails.member();
        if (member == null) {
            throw new IllegalArgumentException("Member details are required to create a login response.");
        }
        
        UserProfile user = customUserDetails.user();
        PublisherProfile publisher = customUserDetails.publisher();
        String profileImageKey = null;
        Long memberId = member.getId();
        Long publisherId = null;
        Long userId = null;
        if (publisher != null) {
            profileImageKey = publisher.getProfileImageKey();
            publisherId = publisher.getId();
        }
        if (user != null) {
            profileImageKey = user.getProfileImageKey();
            userId = user.getId();
        }

        String profileImageURL = fileService.convertToPublicImageURL(profileImageKey);
        Role role = member.getRole();

        String refreshToken = refreshTokenService.issueRefreshToken(memberId);
        String accessToken = jwtUtil.createAccessToken(memberId, userId, publisherId, member.getEmail(), role.name());
        boolean firstPaymentBenefit = creditWalletRepository.existsByUserAndPaymentTransactionsEmpty(user);

        return LoginResponse.builder()
                .refreshToken(refreshToken)
                .accessToken(accessToken)
                .memberId(member.getId())
                .email(member.getEmail())
                .userId(user != null ? user.getId() : null)
                .nickname(user != null ? user.getNickname() : null)
                .publisherId(publisher != null ? publisher.getId() : null)
                .publisherName(publisher != null ? publisher.getPublisherName() : null)
                .profileImageURL(profileImageURL)
                .role(role)
                .firstPaymentBenefit(firstPaymentBenefit)
                .build();
    }
}
