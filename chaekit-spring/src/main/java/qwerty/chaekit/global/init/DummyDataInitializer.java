package qwerty.chaekit.global.init;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import qwerty.chaekit.domain.ebook.credit.wallet.CreditWallet;
import qwerty.chaekit.domain.ebook.credit.wallet.CreditWalletRepository;
import qwerty.chaekit.domain.member.Member;
import qwerty.chaekit.domain.member.MemberRepository;
import qwerty.chaekit.domain.member.enums.Role;
import qwerty.chaekit.domain.member.publisher.PublisherProfile;
import qwerty.chaekit.domain.member.publisher.PublisherProfileRepository;
import qwerty.chaekit.domain.member.user.UserProfile;
import qwerty.chaekit.domain.member.user.UserProfileRepository;
import qwerty.chaekit.service.member.MemberJoinHelper;

@Slf4j
@Component
@RequiredArgsConstructor
@Profile(value = {"local", "dev"})
@Order(2)
public class DummyDataInitializer implements ApplicationRunner {
    private final MemberJoinHelper memberJoinHelper;
    private final PublisherProfileRepository publisherProfileRepository;
    private final MemberRepository memberRepository;
    private final UserProfileRepository userProfileRepository;

    private final String defaultPassword = "0000";
    private final CreditWalletRepository creditWalletRepository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        log.info("Try to create dummy data...");
        createDummyUsers();
        createDummyPublishers();
    }

    private void createDummyUsers() {
        for (int i = 1; i <= 3; i++) {
            String userEmail = getDummyUserEmail(i);
            if (memberRepository.existsByEmail(userEmail)) {
                continue;
            }
            Member userMember = memberJoinHelper.saveMember(userEmail, defaultPassword, Role.ROLE_USER);
            UserProfile savedUser = userProfileRepository.save(
                    UserProfile.builder()
                            .member(userMember)
                            .nickname(getDummyNickname(i))
                            .build()
            );
            creditWalletRepository.save(
                    CreditWallet.builder()
                            .user(savedUser)
                            .build()
            );
            log.info("Created user profile: {}", userEmail);
        }
    }

    private void createDummyPublishers() {
        for (int i = 1; i <= 3; i++) {
            String publisherEmail = getDummyPublisherEmail(i);
            if (memberRepository.existsByEmail(publisherEmail)) {
                continue;
            }
            Member publisherMember = memberJoinHelper.saveMember(publisherEmail, defaultPassword, Role.ROLE_PUBLISHER);
            publisherProfileRepository.save(
                    PublisherProfile.builder()
                            .member(publisherMember)
                            .publisherName(getDummyPublisherName(i))
                            .build()
            );
            log.info("Created publisher profile: {}", publisherEmail);
        }
    }

    private static String getDummyUserEmail(int index) {
        return "user" + index + "@example.com";
    }

    private static String getDummyPublisherEmail(int index) {
        return "publisher" + index + "@example.com";
    }

    private static String getDummyNickname(int index) {
        return "test_user" + index;
    }

    private static String getDummyPublisherName(int index) {
        return "test_publisher" + index;
    }
}
