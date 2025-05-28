package qwerty.chaekit.global.security.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import qwerty.chaekit.domain.member.Member;
import qwerty.chaekit.domain.member.MemberRepository;
import qwerty.chaekit.domain.member.enums.Role;
import qwerty.chaekit.domain.member.publisher.PublisherProfile;
import qwerty.chaekit.domain.member.publisher.PublisherProfileRepository;
import qwerty.chaekit.domain.member.user.UserProfile;
import qwerty.chaekit.domain.member.user.UserProfileRepository;
import qwerty.chaekit.global.security.model.CustomUserDetails;

import java.util.Objects;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {
    private final MemberRepository memberRepository;
    private final UserProfileRepository userRepository;
    private final PublisherProfileRepository publisherRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        // 로그인 성공 시 토큰 발행을 위한 CustomUserDetails 객체 생성
        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("존재하지 않는 사용자입니다."));
        UserProfile user = null;
        PublisherProfile publisher = null;
        Role role = Objects.requireNonNull(member.getRole());
        if (role == Role.ROLE_USER || role == Role.ROLE_ADMIN) {
            user = userRepository.findByMember_Id(member.getId())
                    .orElseThrow(() -> new UsernameNotFoundException("사용자 프로필 데이터를 찾을 수 없습니다."));
        }
        if(role == Role.ROLE_PUBLISHER || role == Role.ROLE_ADMIN) {
            publisher = publisherRepository.findByMember_Id(member.getId())
                    .orElseThrow(() -> new UsernameNotFoundException("출판사 프로필 데이터를 찾을 수 없습니다."));
        }

        return new CustomUserDetails(member, user, publisher);
    }
}
