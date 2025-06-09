package qwerty.chaekit.dto.member;

import lombok.Builder;
import qwerty.chaekit.domain.member.user.UserProfile;

@Builder
public record UserInfoResponse(
        Long memberId,
        String email,
        Long userId,
        String nickname,
        String profileImageURL,
        String role
){
    public static UserInfoResponse of(UserProfile user, String profileImageURL) {
        return UserInfoResponse.builder()
                .memberId(user.getMember().getId())
                .email(user.getMember().getEmail())
                .userId(user.getId())
                .nickname(user.getNickname())
                .profileImageURL(profileImageURL)
                .role(user.getMember().getRole().name())
                .build();
    }
}
