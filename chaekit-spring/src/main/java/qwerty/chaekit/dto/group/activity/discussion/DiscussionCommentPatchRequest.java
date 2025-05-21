package qwerty.chaekit.dto.group.activity.discussion;

import lombok.NonNull;
import org.hibernate.validator.constraints.Length;

public record DiscussionCommentPatchRequest(
        @Length(max = 1000)
        @NonNull String content
) {
}
