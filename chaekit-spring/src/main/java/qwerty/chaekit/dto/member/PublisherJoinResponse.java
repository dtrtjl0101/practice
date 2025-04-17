package qwerty.chaekit.dto.member;

import lombok.Builder;

@Builder
public record PublisherJoinResponse(
        Long id,
        Long publisherId,
        String accessToken,
        String publisherName,
        String username,
        String role,
        Boolean isAccepted
){ }
