package qwerty.chaekit.service.member;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import qwerty.chaekit.domain.member.Member;
import qwerty.chaekit.domain.member.enums.Role;
import qwerty.chaekit.domain.member.MemberRepository;
import qwerty.chaekit.global.enums.ErrorCode;
import qwerty.chaekit.global.exception.BadRequestException;

@Service
@RequiredArgsConstructor
public class MemberJoinHelper {
    private final MemberRepository memberRepository;
    private final BCryptPasswordEncoder bCryptPasswordEncoder;

    public Member saveMember(String email, String password, Role role) {
        validateUsername(email);
        return memberRepository.save(Member.builder()
                .username(email)
                .password(bCryptPasswordEncoder.encode(password))
                .role(role)
                .build());
    }

    private void validateUsername(String username) {
        if (memberRepository.existsByUsername(username)) {
            throw new BadRequestException(ErrorCode.MEMBER_ALREADY_EXISTS);
        }
    }
}
