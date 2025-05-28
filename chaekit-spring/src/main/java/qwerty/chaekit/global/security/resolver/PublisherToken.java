package qwerty.chaekit.global.security.resolver;

import lombok.Builder;

@Builder
public record
PublisherToken(
        Long memberId,
        Long publisherId,
        String email
) {
    public static PublisherToken of(Long memberId, Long publisherId, String email) {
        return new PublisherToken(memberId, publisherId, email);
    }
}