package qwerty.chaekit.dto.group.activity.discussion;

import lombok.Builder;
import qwerty.chaekit.domain.group.activity.Activity;
import qwerty.chaekit.domain.group.activity.discussion.Discussion;

@Builder
public record DiscussionSummaryResponse(
        Long discussionId,
        Long activityId,
        String title,
        Long authorId,
        String authorName
) {
    /*
     * fetch required:
     * - discussion.author
     */
    public static DiscussionSummaryResponse of(Discussion discussion, Activity activity) {
        return DiscussionSummaryResponse.builder()
                .discussionId(discussion.getId())
                .activityId(activity.getId())
                .title(discussion.getTitle())
                .authorId(discussion.getAuthor().getId())
                .authorName(discussion.getAuthor().getNickname())
                .build();
    }
}
