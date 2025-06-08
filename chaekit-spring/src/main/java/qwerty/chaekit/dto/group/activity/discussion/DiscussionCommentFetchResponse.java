package qwerty.chaekit.dto.group.activity.discussion;

import lombok.Builder;
import qwerty.chaekit.domain.group.activity.discussion.DiscussionStance;

import java.time.LocalDateTime;
import java.util.List;

@Builder
public record DiscussionCommentFetchResponse(
        Long commentId,
        Long authorId,
        String authorName,
        String authorProfileImageURL,
        String content,
        LocalDateTime createdAt,
        LocalDateTime modifiedAt,
        boolean isEdited,
        boolean isDeleted,
        DiscussionStance stance,
        Long parentId,
        List<DiscussionCommentFetchResponse> replies
) { }
