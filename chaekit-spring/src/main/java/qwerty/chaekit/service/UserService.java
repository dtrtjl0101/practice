package qwerty.chaekit.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import qwerty.chaekit.domain.Member.user.UserProfileRepository;
import qwerty.chaekit.dto.UserMyInfoResponse;
import qwerty.chaekit.global.exception.NotFoundException;
import qwerty.chaekit.global.security.resolver.LoginMember;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {
    private final UserProfileRepository profileRepository;

    public UserMyInfoResponse getUserProfile(LoginMember loginMember) {
        String nickname = profileRepository.findByMember_Username(loginMember.username())
                .orElseThrow(() -> new NotFoundException("USER_NOT_FOUND", "해당 출판사가 없습니다.")).getNickname();

        return UserMyInfoResponse.builder()
                .id(loginMember.memberId())
                .nickname(nickname)
                .username(loginMember.username())
                .role(loginMember.role())
                .build();
    }
}
