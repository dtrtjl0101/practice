package qwerty.chaekit.global.security.resolver;

import lombok.Builder;

@Builder
public record LoginMember(
        String username,
        String role
) {
}