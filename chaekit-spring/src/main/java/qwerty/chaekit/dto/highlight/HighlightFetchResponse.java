package qwerty.chaekit.dto.highlight;

import lombok.Builder;
import qwerty.chaekit.domain.group.activity.discussion.Discussion;
import qwerty.chaekit.domain.highlight.entity.Highlight;
import qwerty.chaekit.dto.group.activity.discussion.DiscussionSummaryResponse;

import java.util.List;

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
        Long activityId,
        List<DiscussionSummaryResponse> relatedDiscussions,
        String highlightContent
) {
    /*
     * fetch required:
     *   - discussion.author
     *   - highlight.author
     */
    public static HighlightFetchResponse of(Highlight highlight, String authorProfileImageURL, List<Discussion> discussions) {
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
                .highlightContent(highlight.getHighlightcontent())
                .relatedDiscussions(discussions.stream()
                        .map(discussion -> DiscussionSummaryResponse.of(discussion, highlight.getActivity()))
                        .toList())
                .build();
    }
}
