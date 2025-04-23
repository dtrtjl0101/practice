package qwerty.chaekit.service.member.user;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import qwerty.chaekit.domain.member.Member;
import qwerty.chaekit.domain.member.enums.Role;
import qwerty.chaekit.domain.member.user.UserProfile;
import qwerty.chaekit.domain.member.user.UserProfileRepository;
import qwerty.chaekit.dto.member.UserJoinRequest;
import qwerty.chaekit.dto.member.UserJoinResponse;
import qwerty.chaekit.global.enums.ErrorCode;
import qwerty.chaekit.global.exception.BadRequestException;
import qwerty.chaekit.global.jwt.JwtUtil;
import qwerty.chaekit.service.member.MemberJoinHelper;

@Service
@RequiredArgsConstructor
public class UserJoinService {
    private final MemberJoinHelper memberJoinHelper;
    private final UserProfileRepository userRepository;
    private final JwtUtil jwtUtil;

    @Transactional
    public UserJoinResponse join(UserJoinRequest request) {
        String email = request.email();
        String password = request.password();
        String verificationCode = request.verificationCode();

        validateNickname(request.email());
        Member member = memberJoinHelper.saveMemberWithVerificationCode(email, password, Role.ROLE_USER, verificationCode);
        UserProfile user = saveUser(request, member);

        return toResponse(request, member, user);
    }

    private void validateNickname(String nickname) {
        if (userRepository.existsByNickname(nickname)) {
            throw new BadRequestException(ErrorCode.NICKNAME_ALREADY_EXISTS);
        }
    }

    private UserProfile saveUser(UserJoinRequest request, Member member) {
        return userRepository.save(UserProfile.builder()
                .member(member)
                .nickname(request.nickname())
                .build());
    }

    private UserJoinResponse toResponse(UserJoinRequest request, Member member, UserProfile user) {
        String token = jwtUtil.createJwt(member.getId(), user.getId(), null, member.getEmail(), member.getRole().name());

        return UserJoinResponse.builder()
                .memberId(member.getId())
                .userId(user.getId())
                .accessToken("Bearer " + token)
                .email(member.getEmail())
                .nickname(request.nickname())
                .build();
    }
}
