package qwerty.chaekit.dto;

import lombok.Builder;

@Builder
public record PublisherJoinResponse(
        String publisherName,
        String username,
        String role
){ }
