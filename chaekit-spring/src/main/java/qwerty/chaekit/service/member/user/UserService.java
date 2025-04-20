package qwerty.chaekit.service.member.user;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import qwerty.chaekit.domain.member.user.UserProfileRepository;
import qwerty.chaekit.dto.member.UserMemberResponse;
import qwerty.chaekit.global.enums.ErrorCode;
import qwerty.chaekit.global.exception.NotFoundException;
import qwerty.chaekit.global.security.resolver.UserToken;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {
    private final UserProfileRepository userRepository;

    public UserMemberResponse getUserProfile(UserToken userToken) {
        String nickname = userRepository.findById(userToken.userId())
                .orElseThrow(() -> new NotFoundException(ErrorCode.USER_NOT_FOUND)).getNickname();

        return UserMemberResponse.builder()
                .id(userToken.memberId())
                .userId(userToken.userId())
                .email(userToken.email())
                .nickname(nickname)
                .build();
    }
}
