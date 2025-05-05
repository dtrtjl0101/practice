package qwerty.chaekit.dto.group.activity.discussion;

public record DiscussionFetchResponse(
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
        boolean isAuthor
) {
}
