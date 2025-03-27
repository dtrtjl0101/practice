package qwerty.chaekit.dto;

import lombok.Builder;

@Builder
public record PublisherMyInfoResponse(
        String publisherName,
        String username,
        String role
){ }
