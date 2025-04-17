package qwerty.chaekit.dto.member;

import lombok.Builder;

@Builder
public record PublisherMemberResponse(
        Long id,
        Long profileId,
        String publisherName,
        String email,
        String role,
        Boolean isAccepted
){ }
