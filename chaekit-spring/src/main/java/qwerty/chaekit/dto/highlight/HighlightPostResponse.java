package qwerty.chaekit.dto.highlight;

import lombok.Builder;
import qwerty.chaekit.domain.highlight.Highlight;

@Builder
public record HighlightPostResponse(
        Long id,
        Long bookId,
        String spine,
        String cfi,
        String memo,
        Long activityId,
        String highlightContent
) {
    public static HighlightPostResponse of(Highlight highlight) {
        return HighlightPostResponse.builder()
                .id(highlight.getId())
                .bookId(highlight.getBook().getId())
                .spine(highlight.getSpine())
                .cfi(highlight.getCfi())
                .memo(highlight.getMemo())
                .activityId(highlight.getActivity() != null ? highlight.getActivity().getId() : null)
                .highlightContent(highlight.getHighlightcontent())
                .build();
    }
}
