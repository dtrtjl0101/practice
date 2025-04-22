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
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Member memberData = memberRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("존재하지 않는 사용자입니다."));
        Long userId = null, publisherId = null;
        Role role = Objects.requireNonNull(memberData.getRole());
        if (role == Role.ROLE_USER || role == Role.ROLE_ADMIN) {
            userId = userRepository.findByMember_Id(memberData.getId())
                    .map(UserProfile::getId)
                    .orElseThrow(() -> new UsernameNotFoundException("사용자 프로필 데이터를 찾을 수 없습니다."));
        }
        if(role == Role.ROLE_PUBLISHER || role == Role.ROLE_ADMIN) {
            publisherId = publisherRepository.findByMember_Id(memberData.getId())
                    .map(PublisherProfile::getId)
                    .orElseThrow(() -> new UsernameNotFoundException("출판사 프로필 데이터를 찾을 수 없습니다."));
        }

        return new CustomUserDetails(
                memberData.getId(),
                userId,
                publisherId,
                memberData.getUsername(),
                memberData.getPassword(),
                memberData.getRole().name()
        );
    }
}
