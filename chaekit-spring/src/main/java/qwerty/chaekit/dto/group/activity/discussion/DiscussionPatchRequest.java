package qwerty.chaekit.dto.group.activity.discussion;

public record DiscussionPatchRequest(
        Long discussionId,
        String title,
        String content,
        boolean isDebate
) { }
