package qwerty.chaekit.dto.group.activity.discussion;


import jakarta.validation.constraints.NotNull;
import qwerty.chaekit.domain.group.activity.discussion.DiscussionStance;

public record DiscussionCommentPostRequest(
        Long parentId,
        @NotNull
        String content,
        @NotNull
        DiscussionStance stance
) {
}
