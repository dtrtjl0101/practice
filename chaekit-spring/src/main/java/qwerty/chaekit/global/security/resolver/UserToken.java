package qwerty.chaekit.global.security.resolver;

import lombok.Builder;

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
                .memberId(null)
                .userId(null)
                .email(null)
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
}