package qwerty.chaekit.dto.member;

import lombok.Builder;

@Builder
public record PublisherJoinResponse(
        Long memberId,
        Long publisherId,
        String accessToken,
        String publisherName,
        String email,
        String profileImageURL,
        Boolean isAccepted
){ }
