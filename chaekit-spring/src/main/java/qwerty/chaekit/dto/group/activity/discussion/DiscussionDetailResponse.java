package qwerty.chaekit.dto.group.activity.discussion;

import lombok.Builder;

import java.time.LocalDateTime;
import java.util.List;

@Builder
public record DiscussionDetailResponse(
        Long discussionId,
        Long activityId,
        String title,
        String content,
        Long authorId,
        String authorName,
        String authorProfileImage,
        LocalDateTime createdAt,
        LocalDateTime modifiedAt,
        Long commentCount,
        boolean isDebate,
        boolean isAuthor,
        List<Long> highlightIds,
        List<DiscussionCommentFetchResponse> comments
) {
}
