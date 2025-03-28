package qwerty.chaekit.dto;

import lombok.Builder;

@Builder
public record PublisherMyInfoResponse(
        Long id,
        String publisherName,
        String username,
        String role
){ }
