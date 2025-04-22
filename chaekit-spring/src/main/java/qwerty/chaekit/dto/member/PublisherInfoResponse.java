package qwerty.chaekit.dto.member;

import lombok.Builder;
import qwerty.chaekit.domain.member.publisher.PublisherProfile;

import java.time.LocalDateTime;

@Builder
public record PublisherInfoResponse(
        Long id,
        Long publisherId,
        String publisherName,
        LocalDateTime createdAt
) {
    public static PublisherInfoResponse of(PublisherProfile publisher) {
        return PublisherInfoResponse.builder()
                .id(publisher.getMember().getId())
                .publisherId(publisher.getId())
                .publisherName(publisher.getPublisherName())
                .createdAt(publisher.getCreatedAt())
                .build();
    }
}