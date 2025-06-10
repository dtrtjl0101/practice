package qwerty.chaekit.dto.highlight;

import lombok.Builder;
import qwerty.chaekit.domain.group.activity.discussion.Discussion;
import qwerty.chaekit.domain.highlight.Highlight;
import qwerty.chaekit.dto.group.activity.discussion.DiscussionSummaryResponse;

import java.time.LocalDateTime;
import java.util.List;

@Builder
public record HighlightFetchResponse(
        Long id,
        Long bookId,
        String bookTitle,
        String bookAuthor,
        String bookCoverImageURL,
        Long authorId,
        String authorName,
        String authorProfileImageURL,
        String spine,
        String cfi,
        String memo,
        Long activityId,
        Long groupId,
        String groupName,
        String groupImageURL,
        List<DiscussionSummaryResponse> linkedDiscussions,
        String highlightContent,
        LocalDateTime createdAt
) {
    /*
     * fetch required:
     *   - discussion.author
     *   - highlight.author
     */
    public static HighlightFetchResponse of(
            Highlight highlight,
            String authorProfileImageURL,
            String bookCoverImageURL,
            String groupImageURL,
            List<Discussion> discussions
    ) {
        return HighlightFetchResponse.builder()
                .id(highlight.getId())
                .bookId(highlight.getBook().getId())
                .bookTitle(highlight.getBook().getTitle())
                .bookAuthor(highlight.getBook().getAuthor())
                .bookCoverImageURL(bookCoverImageURL)
                .authorId(highlight.getAuthor().getId())
                .authorName(highlight.getAuthor().getNickname())
                .authorProfileImageURL(authorProfileImageURL)
                .spine(highlight.getSpine())
                .cfi(highlight.getCfi())
                .memo(highlight.getMemo())
                .activityId(highlight.getActivity() != null ? highlight.getActivity().getId() : null)
                .groupId(highlight.getActivity() != null ? highlight.getActivity().getGroup().getId() : null)
                .groupName(highlight.getActivity() != null ? highlight.getActivity().getGroup().getName() : null)
                .groupImageURL(groupImageURL)
                .highlightContent(highlight.getHighlightcontent())
                .linkedDiscussions(
                        discussions.stream()
                            .map(discussion -> DiscussionSummaryResponse.of(discussion, discussion.getActivity()))
                            .toList()
                )
                .createdAt(highlight.getCreatedAt())
                .build();
    }
}
