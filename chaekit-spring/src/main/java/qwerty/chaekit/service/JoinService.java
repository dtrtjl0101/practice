package qwerty.chaekit.service;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import qwerty.chaekit.domain.Member.Member;
import qwerty.chaekit.dto.JoinDto;
import qwerty.chaekit.domain.Member.MemberRepository;

@Service
public class JoinService {
    private final MemberRepository memberRepository;
    private final BCryptPasswordEncoder bCryptPasswordEncoder;

    public JoinService(MemberRepository memberRepository, BCryptPasswordEncoder bCryptPasswordEncoder) {

        this.memberRepository = memberRepository;
        this.bCryptPasswordEncoder = bCryptPasswordEncoder;
    }

    public void joinProcess(JoinDto joinDto) {

        String username = joinDto.getUsername();
        String password = joinDto.getPassword();

        Boolean isExist = memberRepository.existsByUsername(username);

        if (isExist) {

            return;
        }

        Member data=Member.builder()
                .username(username)
                .password(bCryptPasswordEncoder.encode(password))
                .role("ROLE_ADMIN")
                .build();

        memberRepository.save(data);
    }
}
