package qwerty.chaekit.dto.group.activity.discussion;

import lombok.Builder;

import java.time.LocalDateTime;

@Builder
public record DiscussionFetchResponse(
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
        boolean isAuthor
) {
}
