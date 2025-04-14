package qwerty.chaekit.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import qwerty.chaekit.domain.member.Member;
import qwerty.chaekit.domain.member.enums.Role;
import qwerty.chaekit.domain.member.user.UserProfile;
import qwerty.chaekit.domain.member.user.UserProfileRepository;
import qwerty.chaekit.dto.member.UserJoinRequest;
import qwerty.chaekit.dto.member.UserJoinResponse;
import qwerty.chaekit.global.exception.BadRequestException;
import qwerty.chaekit.global.jwt.JwtUtil;

@Service
@RequiredArgsConstructor
public class UserJoinService {
    private final MemberJoinHelper memberJoinHelper;
    private final UserProfileRepository userProfileRepository;
    private final JwtUtil jwtUtil;

    @Transactional
    public UserJoinResponse join(UserJoinRequest request) {
        String username = request.username();
        String password = request.password();

        validateNickname(request.username());
        Member member = memberJoinHelper.saveMember(username, password, Role.ROLE_USER);
        saveProfile(request, member);

        return toResponse(request, member);
    }

    private void validateNickname(String nickname) {
        if (userProfileRepository.existsByNickname(nickname)) {
            throw new BadRequestException("NICKNAME_EXISTS", "이미 사용중인 이름입니다");
        }
    }

    private void saveProfile(UserJoinRequest request, Member member) {
        userProfileRepository.save(UserProfile.builder()
                .member(member)
                .nickname(request.nickname())
                .build());
    }

    private UserJoinResponse toResponse(UserJoinRequest request, Member member) {
        String token = jwtUtil.createJwt(member.getId(), member.getUsername(), member.getRole().name());

        return UserJoinResponse.builder()
                .id(member.getId())
                .accessToken(token)
                .username(member.getUsername())
                .nickname(request.nickname())
                .role(member.getRole().name())
                .build();
    }
}
