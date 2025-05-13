package qwerty.chaekit.dto.highlight;

import lombok.Builder;
import qwerty.chaekit.domain.highlight.entity.Highlight;

@Builder
public record HighlightFetchResponse(
        Long id,
        Long bookId,
        Long authorId,
        String authorName,
        String authorProfileImageURL,
        String spine,
        String cfi,
        String memo,
        Long activityId
) {
    public static HighlightFetchResponse of(Highlight highlight, String authorProfileImageURL) {
        return HighlightFetchResponse.builder()
                .id(highlight.getId())
                .bookId(highlight.getBook().getId())
                .authorId(highlight.getAuthor().getId())
                .authorName(highlight.getAuthor().getNickname())
                .authorProfileImageURL(authorProfileImageURL)
                .spine(highlight.getSpine())
                .cfi(highlight.getCfi())
                .memo(highlight.getMemo())
                .activityId(highlight.getActivity() != null ? highlight.getActivity().getId() : null)
                .build();
    }
}
