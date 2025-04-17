package qwerty.chaekit.service.member.user;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import qwerty.chaekit.domain.member.user.UserProfileRepository;
import qwerty.chaekit.dto.member.UserMemberResponse;
import qwerty.chaekit.global.enums.ErrorCode;
import qwerty.chaekit.global.exception.NotFoundException;
import qwerty.chaekit.global.security.resolver.LoginMember;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {
    private final UserProfileRepository profileRepository;

    public UserMemberResponse getUserProfile(LoginMember loginMember) {
        String nickname = profileRepository.findById(loginMember.profileId())
                .orElseThrow(() -> new NotFoundException(ErrorCode.USER_NOT_FOUND)).getNickname();

        return UserMemberResponse.builder()
                .id(loginMember.memberId())
                .profileId(loginMember.profileId())
                .username(loginMember.email())
                .nickname(nickname)
                .role(loginMember.role())
                .build();
    }
}
