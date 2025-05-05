package qwerty.chaekit.dto.group.activity.discussion;

import java.time.LocalDateTime;
import java.util.List;

public record DiscussionCommentFetchResponse(
        Long commentId,
        Long authorId,
        String authorName,
        String authorProfileImageURL,
        String content,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        boolean edited,
        String stance,
        Long parentId,
        List<DiscussionCommentFetchResponse> replies
) { }
