package qwerty.chaekit.dto.highlight.comment;

import qwerty.chaekit.domain.highlight.entity.comment.HighlightComment;
import qwerty.chaekit.domain.highlight.entity.reaction.HighlightReaction;
import qwerty.chaekit.dto.highlight.reaction.HighlightReactionResponse;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public record HighlightCommentResponse(
    Long id,
    Long authorId,
    String authorName,
    String content,
    LocalDateTime createdAt,
    LocalDateTime updatedAt,
    List<HighlightCommentResponse> replies,
    List<HighlightReactionResponse> reactions
) {
    public static HighlightCommentResponse of(HighlightComment comment) {
        return of(comment, Collections.emptyMap());
    }
    
    public static HighlightCommentResponse of(HighlightComment comment, Map<Long, List<HighlightReaction>> reactionsByCommentId) {
        List<HighlightCommentResponse> replies = comment.getReplies().stream()
                .map(reply -> of(reply, reactionsByCommentId))
                .collect(Collectors.toList());

        List<HighlightReactionResponse> reactions = reactionsByCommentId.getOrDefault(comment.getId(), Collections.emptyList())
                .stream()
                .map(HighlightReactionResponse::of)
                .collect(Collectors.toList());
                
        return new HighlightCommentResponse(
            comment.getId(),
            comment.getAuthor().getId(),
            comment.getAuthor().getNickname(),
            comment.getContent(),
            comment.getCreatedAt(),
            comment.getModifiedAt(),
            replies,
            reactions
        );
    }
} 