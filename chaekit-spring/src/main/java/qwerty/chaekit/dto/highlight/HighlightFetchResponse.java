package qwerty.chaekit.dto.highlight;

import lombok.Builder;
import qwerty.chaekit.domain.highlight.entity.Highlight;

@Builder
public record HighlightFetchResponse(
        Long id,
        Long bookId,
        String spine,
        String cfi,
        String memo,
        Long activityId
) {
    public static HighlightFetchResponse of(Highlight highlight) {
        return HighlightFetchResponse.builder()
                .id(highlight.getId())
                .bookId(highlight.getBook().getId())
                .spine(highlight.getSpine())
                .cfi(highlight.getCfi())
                .memo(highlight.getMemo())
                .build();
    }
}
