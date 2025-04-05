package qwerty.chaekit.dto.highlight;

import lombok.Builder;

@Builder
public record HighlightPostRequest(
        Long bookId,
        String spine,
        String cfi,
        Long activityId,
        String memo
) { }
