package qwerty.chaekit.dto.highlight;

import lombok.Builder;
import qwerty.chaekit.domain.group.activity.discussion.Discussion;
import qwerty.chaekit.domain.highlight.entity.Highlight;
import qwerty.chaekit.dto.group.activity.discussion.DiscussionSummaryResponse;

import java.util.List;

@Builder
public record HighlightSummaryResponse(
        Long id,
        Long bookId,
        Long authorId,
        String authorName,
        String authorProfileImageURL,
        String spine,
        String cfi,
        String memo,
        String highlightContent
) {
    /*
     * fetch required:
     *   - highlight.author
     */
    public static HighlightSummaryResponse of(Highlight highlight, String authorProfileImageURL) {
        return HighlightSummaryResponse.builder()
                .id(highlight.getId())
                .bookId(highlight.getBook().getId())
                .authorId(highlight.getAuthor().getId())
                .authorName(highlight.getAuthor().getNickname())
                .authorProfileImageURL(authorProfileImageURL)
                .spine(highlight.getSpine())
                .cfi(highlight.getCfi())
                .memo(highlight.getMemo())
                .highlightContent(highlight.getHighlightcontent())
                .build();
    }
}
