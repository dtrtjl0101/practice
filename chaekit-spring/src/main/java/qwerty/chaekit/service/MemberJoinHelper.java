package qwerty.chaekit.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import qwerty.chaekit.domain.member.Member;
import qwerty.chaekit.domain.member.enums.Role;
import qwerty.chaekit.domain.member.MemberRepository;
import qwerty.chaekit.global.exception.BadRequestException;

@Service
@RequiredArgsConstructor
public class MemberJoinHelper {
    private final MemberRepository memberRepository;
    private final BCryptPasswordEncoder bCryptPasswordEncoder;

    public Member saveMember(String username, String password, Role role) {
        validateUsername(username);
        return memberRepository.save(Member.builder()
                .username(username)
                .password(bCryptPasswordEncoder.encode(password))
                .role(role)
                .build());
    }

    private void validateUsername(String username) {
        if (memberRepository.existsByUsername(username)) {
            throw new BadRequestException("MEMBER_ALREADY_EXISTS","이미 존재하는 회원입니다");
        }
    }
}
