package qwerty.chaekit.global.security.resolver;

import lombok.Builder;

@Builder
public record UserToken(
        Long memberId,
        Long userId,
        String email,
        String role
) {
}