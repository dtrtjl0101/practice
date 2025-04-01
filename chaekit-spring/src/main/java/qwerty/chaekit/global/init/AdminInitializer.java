package qwerty.chaekit.global.init;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import qwerty.chaekit.domain.Member.Member;
import qwerty.chaekit.domain.Member.MemberRepository;
import qwerty.chaekit.domain.Member.enums.Role;
import qwerty.chaekit.global.exception.BadRequestException;
import qwerty.chaekit.global.properties.AdminProperties;
import qwerty.chaekit.service.AdminService;
import qwerty.chaekit.service.MemberJoinHelper;

import java.util.Optional;

@Slf4j
@Component
@RequiredArgsConstructor
public class AdminInitializer implements ApplicationRunner {
    private final AdminProperties adminProperties;
    private final MemberJoinHelper memberJoinHelper;
    private final MemberRepository memberRepository;
    private final AdminService adminService;


    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        String username = adminProperties.username();
        String password = adminProperties.password();
        Role adminRole = Role.ROLE_ADMIN;

        try {
            Member savedAdmin = memberJoinHelper.saveMember(username, password, adminRole);
            log.info("관리자가 생성되었습니다. memberId = {}", savedAdmin.getId());
            adminService.setAdminId(savedAdmin.getId());
        } catch (BadRequestException e) {
            Optional<Member> admin = memberRepository.findByUsername(username);
            if(admin.isPresent()) {
                adminService.setAdminId(admin.get().getId());
                log.info("관리자가 이미 존재합니다.");
            } else {
                throw new IllegalStateException("관리자 생성에 실패했습니다.");
            }
        }
    }
}
