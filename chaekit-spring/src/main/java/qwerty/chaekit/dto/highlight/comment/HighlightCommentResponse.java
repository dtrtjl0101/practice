package qwerty.chaekit.dto.highlight.comment;

import qwerty.chaekit.dto.highlight.reaction.HighlightReactionResponse;

import java.time.LocalDateTime;
import java.util.List;

public record HighlightCommentResponse(
    Long id,
    Long authorId,
    String authorName,
    String authorProfileImageURL,
    String content,
    LocalDateTime createdAt,
    LocalDateTime updatedAt,
    List<HighlightCommentResponse> replies,
    List<HighlightReactionResponse> reactions
) { } 