package qwerty.chaekit.dto.group.activity.discussion;

public record DiscussionPostRequest(
        String title,
        String content,
        boolean isDebate
) { }
