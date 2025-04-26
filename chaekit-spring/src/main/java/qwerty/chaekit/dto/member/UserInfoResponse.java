package qwerty.chaekit.dto.member;

import lombok.Builder;
import qwerty.chaekit.domain.member.user.UserProfile;

@Builder
public record UserInfoResponse(
        Long userId,
        String nickname,
        String profileImageURL
){
    public static UserInfoResponse of(UserProfile user, String profileImageURL) {
        return UserInfoResponse.builder()
                .userId(user.getId())
                .nickname(user.getNickname())
                .profileImageURL(profileImageURL)
                .build();
    }
}
