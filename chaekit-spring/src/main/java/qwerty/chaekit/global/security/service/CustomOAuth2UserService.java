package qwerty.chaekit.global.security.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import qwerty.chaekit.domain.ebook.credit.wallet.CreditWallet;
import qwerty.chaekit.domain.ebook.credit.wallet.CreditWalletRepository;
import qwerty.chaekit.domain.member.Member;
import qwerty.chaekit.domain.member.MemberRepository;
import qwerty.chaekit.domain.member.enums.Role;
import qwerty.chaekit.domain.member.user.UserProfile;
import qwerty.chaekit.domain.member.user.UserProfileRepository;
import qwerty.chaekit.global.security.model.CustomUserDetails;

import java.util.Map;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class CustomOAuth2UserService implements OAuth2UserService<OAuth2UserRequest, OAuth2User> {
    private final MemberRepository memberRepository;
    private final UserProfileRepository userProfileRepository;
    private final CreditWalletRepository creditWalletRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest request) throws OAuth2AuthenticationException {
        OAuth2User oauth2User = new DefaultOAuth2UserService().loadUser(request);
        Map<String, Object> attributes = oauth2User.getAttributes();

        String email = (String) attributes.get("email");
        String rawName = (String) attributes.getOrDefault("name", null);
        String profileImageUrl = (String) attributes.getOrDefault("picture", null);

        String baseNickname = (rawName != null && !rawName.isBlank()) ? rawName : "Anonymous";

        Member member = memberRepository.findByEmail(email)
                .orElseGet(() -> {
                    Member newMember = Member.builder()
                            .email(email)
                            .password("oauth2-password")
                            .role(Role.ROLE_USER)
                            .build();
                    memberRepository.save(newMember);

                    // 닉네임 생성 (중복 방지)
                    String nickname = generateUniqueNickname(baseNickname);

                    UserProfile userProfile = UserProfile.builder()
                            .member(newMember)
                            .nickname(nickname)
                            .profileImageKey("oauth2-profile-image/" + profileImageUrl)
                            .build();
                    log.info("OAuth2 User Profile Created: {}", userProfile);
                    userProfileRepository.save(userProfile);
                    creditWalletRepository.save(
                            CreditWallet.builder()
                                    .user(userProfile)
                                    .build()
                    );
                    return newMember;
                });

        UserProfile userProfile = userProfileRepository.findByMember_Id(member.getId()).orElse(null);
        return new CustomUserDetails(member, userProfile, null, attributes);
    }

    private String generateUniqueNickname(String base) {
        final int MAX_ATTEMPTS = 10;

        for (int i = 0; i < MAX_ATTEMPTS; i++) {
            String code = String.format("_%04d", (int)(Math.random() * 10000));
            String candidate = base + code;
            boolean exists = userProfileRepository.existsByNickname(candidate);
            if (!exists) {
                return candidate;
            }
        }

        throw new RuntimeException("중복되지 않는 닉네임을 생성할 수 없습니다.");
    }
}
