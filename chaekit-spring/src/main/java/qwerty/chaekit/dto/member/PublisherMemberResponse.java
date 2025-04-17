package qwerty.chaekit.dto.member;

import lombok.Builder;

@Builder
public record PublisherMemberResponse(
        Long id,
        Long publisherId,
        String publisherName,
        String email,
        String role,
        Boolean isAccepted
){ }
