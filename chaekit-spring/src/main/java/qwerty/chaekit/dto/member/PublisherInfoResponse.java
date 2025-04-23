package qwerty.chaekit.dto.member;

import lombok.Builder;
import qwerty.chaekit.domain.member.publisher.PublisherProfile;

import java.time.LocalDateTime;

@Builder
public record PublisherInfoResponse(
        Long publisherId,
        String publisherName,
        String profileImageURL,
        Boolean isAccepted,
        LocalDateTime createdAt
) {
    public static PublisherInfoResponse of(PublisherProfile publisher, String profileImageURL) {
        return PublisherInfoResponse.builder()
                .publisherId(publisher.getId())
                .publisherName(publisher.getPublisherName())
                .profileImageURL(profileImageURL)
                .isAccepted(publisher.isAccepted())
                .createdAt(publisher.getCreatedAt())
                .build();
    }
}