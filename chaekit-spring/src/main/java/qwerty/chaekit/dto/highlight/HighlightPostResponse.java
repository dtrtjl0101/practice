package qwerty.chaekit.dto.highlight;

import lombok.Builder;
import qwerty.chaekit.domain.highlight.entity.Highlight;

@Builder
public record HighlightPostResponse(
        Long id,
        Long bookId,
        String spine,
        String cfi,
        String memo
) {
    public static HighlightPostResponse of(Highlight highlight) {
    return HighlightPostResponse.builder()
            .id(highlight.getId())
            .bookId(highlight.getBook().getId())
            .spine(highlight.getSpine())
            .cfi(highlight.getCfi())
            .memo(highlight.getMemo())
            .build();
    }
}
