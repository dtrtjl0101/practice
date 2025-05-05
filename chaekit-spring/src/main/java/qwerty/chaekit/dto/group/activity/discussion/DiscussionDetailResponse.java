package qwerty.chaekit.dto.group.activity.discussion;

import java.util.List;

public record DiscussionDetailResponse(
        Long discussionId,
        Long groupId,
        Long activityId,
        String title,
        String content,
        Long authorId,
        String createdAt,
        String updatedAt,
        int commentCount,
        boolean isDebate,
        boolean isAuthor,
        List<DiscussionCommentFetchResponse> comments
) {
}
