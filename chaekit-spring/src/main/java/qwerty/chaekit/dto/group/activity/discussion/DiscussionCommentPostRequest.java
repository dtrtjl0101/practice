package qwerty.chaekit.dto.group.activity.discussion;


import jakarta.validation.constraints.NotNull;
import org.hibernate.validator.constraints.Length;
import qwerty.chaekit.domain.group.activity.discussion.DiscussionStance;

public record DiscussionCommentPostRequest(
        Long parentId,
        @NotNull
        @Length(max = 1000)
        String content,
        @NotNull
        DiscussionStance stance
) {
}
