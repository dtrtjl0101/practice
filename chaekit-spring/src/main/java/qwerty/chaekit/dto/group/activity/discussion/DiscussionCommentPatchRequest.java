package qwerty.chaekit.dto.group.activity.discussion;

import lombok.NonNull;

public record DiscussionCommentPatchRequest(
        @NonNull String content
) {
}
