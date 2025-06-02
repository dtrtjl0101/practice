package qwerty.chaekit.global.security.resolver;

import lombok.Builder;
import qwerty.chaekit.domain.member.user.UserProfile;

@Builder
public record UserToken(
        boolean isAnonymous,
        Long memberId,
        Long userId,
        String email
) {
    public static UserToken anonymous() {
        return UserToken.builder()
                .isAnonymous(true)
                .build();
    }

    public static UserToken of(Long memberId, Long userId, String email) {
        return UserToken.builder()
                .isAnonymous(false)
                .memberId(memberId)
                .userId(userId)
                .email(email)
                .build();
    }
    
    public static UserToken of(UserProfile userProfile) {
        return UserToken.builder()
                .isAnonymous(false)
                .userId(userProfile.getId())
                .build();
    }
}