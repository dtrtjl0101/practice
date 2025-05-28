package qwerty.chaekit.global.init;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import qwerty.chaekit.domain.ebook.credit.wallet.CreditWallet;
import qwerty.chaekit.domain.ebook.credit.wallet.CreditWalletRepository;
import qwerty.chaekit.domain.member.Member;
import qwerty.chaekit.domain.member.MemberRepository;
import qwerty.chaekit.domain.member.enums.Role;
import qwerty.chaekit.domain.member.user.UserProfile;
import qwerty.chaekit.domain.member.user.UserProfileRepository;
import qwerty.chaekit.global.init.dummy.DummyUser;
import qwerty.chaekit.service.member.MemberJoinHelper;

@Slf4j
@Component
@RequiredArgsConstructor
public class DummyUserFactory {
    private final MemberRepository memberRepository;
    private final UserProfileRepository userProfileRepository;
    private final MemberJoinHelper memberJoinHelper;
    private final CreditWalletRepository creditWalletRepository;
    
    public void saveDummyUsers() {
        saveDummyUser(DummyUser.LEADER);
        saveDummyUser(DummyUser.USER1);
        saveDummyUser(DummyUser.USER2);
        saveDummyUser(DummyUser.USER3);
    }
    
    public void saveDummyUser(DummyUser dummyUser) {
        String email = dummyUser.getEmail();
        String nickname = dummyUser.getNickname();
        String profileImageKey = dummyUser.getProfileImageKey();
        String defaultPassword = "0000";
        if (memberRepository.existsByEmail(email)) {
            return;
        }

        Member userMember = memberJoinHelper.saveMember(email, defaultPassword, Role.ROLE_USER);
        UserProfile savedUser = userProfileRepository.save(
                UserProfile.builder()
                        .member(userMember)
                        .nickname(nickname)
                        .profileImageKey(profileImageKey)
                        .build()
        );
        creditWalletRepository.save(
                CreditWallet.builder()
                        .user(savedUser)
                        .build()
        );
        
        log.info("유저 \"{}\"가 생성되었습니다.", nickname);
    }
}
