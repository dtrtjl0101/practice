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
    private final UserProfileRepository userProfileRepository;
    private final PublisherProfileRepository publisherProfileRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Member userData = memberRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("존재하지 않는 사용자입니다."));
        Long profileId;
        if (Objects.requireNonNull(userData.getRole()) == Role.ROLE_USER) {
            profileId = userProfileRepository.findByMember_Id(userData.getId())
                    .map(UserProfile::getId)
                    .orElseThrow(() -> new UsernameNotFoundException("사용자 프로필 데이터를 찾을 수 없습니다."));
        } else {
            profileId = publisherProfileRepository.findByMember_Id(userData.getId())
                    .map(PublisherProfile::getId)
                    .orElseThrow(() -> new UsernameNotFoundException("출판사 프로필 데이터를 찾을 수 없습니다."));
        }

        return new CustomUserDetails(
                userData.getId(),
                profileId,
                userData.getUsername(),
                userData.getPassword(),
                userData.getRole().name()
        );
    }
}
