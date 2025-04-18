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
        String adminUsername = adminProperties.username();
        String adminPassword = adminProperties.password();
        Role adminRole = Role.ROLE_ADMIN;

        Optional<Member> existingAdmin = memberRepository.findByUsername(adminUsername);

        if (existingAdmin.isEmpty()) {
            // 관리자가 없으면 생성
            Member savedAdmin = memberJoinHelper.saveMember(adminUsername, adminPassword, adminRole);
            PublisherProfile adminPublisher = publisherProfileRepository.save(new PublisherProfile(savedAdmin, adminUsername));
            adminService.acceptPublisher(adminPublisher.getId());
            adminService.setAdminPublisherId(adminPublisher.getId());
            log.info("관리자가 생성되었습니다. memberId = {}", savedAdmin.getId());
        } else {
            // 이미 관리자가 존재할 때
            Member admin = existingAdmin.get();
            Optional<PublisherProfile> publisher = publisherProfileRepository.findByMember_Username(adminUsername);

            PublisherProfile adminPublisher = publisher.orElseGet(() -> {
                PublisherProfile newProfile = publisherProfileRepository.save(new PublisherProfile(admin, adminUsername));
                log.info("관리자 출판사 프로필이 존재하지 않아 추가되었습니다.");
                return newProfile;
            });

            Optional<UserProfile> user = userProfileRepository.findByMember_Username(adminUsername);

            UserProfile adminUser = user.orElseGet(() -> {
                UserProfile newProfile = userProfileRepository.save(new UserProfile(admin, adminUsername));
                log.info("관리자 사용자 프로필이 존재하지 않아 추가되었습니다.");
                return newProfile;
            });

            adminService.setAdminPublisherId(adminPublisher.getId());
            adminService.setAdminUserId(adminUser.getId());
            log.info("관리자가 이미 존재합니다. memberId = {}", admin.getId());
        }
    }
}
