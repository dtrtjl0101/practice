package qwerty.chaekit.global.init;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import qwerty.chaekit.domain.member.Member;
import qwerty.chaekit.domain.member.MemberRepository;
import qwerty.chaekit.domain.member.enums.Role;
import qwerty.chaekit.domain.member.publisher.PublisherProfile;
import qwerty.chaekit.domain.member.publisher.PublisherProfileRepository;
import qwerty.chaekit.domain.member.user.UserProfile;
import qwerty.chaekit.domain.member.user.UserProfileRepository;
import qwerty.chaekit.global.properties.AdminProperties;
import qwerty.chaekit.service.member.admin.AdminService;
import qwerty.chaekit.service.member.MemberJoinHelper;

import java.util.Optional;

@Slf4j
@Component
@RequiredArgsConstructor
public class AdminInitializer implements ApplicationRunner {
    private final AdminProperties adminProperties;
    private final MemberJoinHelper memberJoinHelper;
    private final PublisherProfileRepository publisherProfileRepository;
    private final AdminService adminService;
    private final MemberRepository memberRepository;
    private final UserProfileRepository userProfileRepository;


    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        String adminName = adminProperties.name();
        String adminEmail = adminProperties.email();
        String adminPassword = adminProperties.password();
        Role adminRole = Role.ROLE_ADMIN;

        Member adminMember = memberRepository.findByEmail(adminEmail).orElseGet(
                () -> {
                    // 관리자가 없으면 생성
                    Member newMember = memberJoinHelper.saveMember(adminEmail, adminPassword, adminRole);
                    log.info("관리자가 생성되었습니다. memberId = {}", newMember.getId());
                    return newMember;
                }
        );

        Optional<PublisherProfile> publisher = publisherProfileRepository.findByMember_Email(adminEmail);
        PublisherProfile adminPublisher = publisher.orElseGet(() -> {
            PublisherProfile newProfile = publisherProfileRepository.save(
                    PublisherProfile.builder()
                            .member(adminMember)
                            .publisherName(adminName)
                            .build()
            );
            newProfile.acceptPublisher();
            log.info("관리자 출판사 프로필이 추가되었습니다.");
            return newProfile;
        });

        Optional<UserProfile> user = userProfileRepository.findByMember_Email(adminEmail);
        UserProfile adminUser = user.orElseGet(() -> {
            UserProfile newProfile = userProfileRepository.save(
                    UserProfile.builder()
                            .member(adminMember)
                            .nickname(adminName)
                            .build()
            );
            log.info("관리자 사용자 프로필이 추가되었습니다.");
            return newProfile;
        });

        adminService.setAdminPublisherId(adminPublisher.getId());
        adminService.setAdminUserId(adminUser.getId());
        log.info("관리자 설정이 완료되었습니다. email = {}, memberId = {}, publisherId = {}, userId = {}",
                adminEmail, adminMember.getId(), adminPublisher.getId(), adminUser.getId()
        );
    }
}
