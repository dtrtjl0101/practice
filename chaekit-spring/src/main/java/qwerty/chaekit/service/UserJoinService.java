package qwerty.chaekit.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import qwerty.chaekit.domain.Member.Member;
import qwerty.chaekit.domain.Member.enums.Role;
import qwerty.chaekit.domain.Member.user.UserProfile;
import qwerty.chaekit.domain.Member.user.UserProfileRepository;
import qwerty.chaekit.dto.UserJoinRequest;
import qwerty.chaekit.dto.UserMyInfoResponse;
import qwerty.chaekit.global.exception.BadRequestException;

@Service
@RequiredArgsConstructor
public class UserJoinService {
    private final MemberJoinHelper memberJoinHelper;
    private final UserProfileRepository userProfileRepository;

    @Transactional
    public UserMyInfoResponse join(UserJoinRequest request) {
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

    private UserMyInfoResponse toResponse(UserJoinRequest request, Member member) {
        return UserMyInfoResponse.builder()
                .id(member.getId())
                .username(member.getUsername())
                .nickname(request.nickname())
                .role(member.getRole().name())
                .build();
    }
}
