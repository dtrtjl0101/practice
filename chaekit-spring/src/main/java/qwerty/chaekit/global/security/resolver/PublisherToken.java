package qwerty.chaekit.global.security.resolver;

import lombok.Builder;

@Builder
public record PublisherToken(
        Long memberId,
        Long publisherId,
        String email
) {
}