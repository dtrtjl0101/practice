package qwerty.chaekit.dto.highlight.comment;

import qwerty.chaekit.domain.highlight.entity.comment.HighlightComment;
import qwerty.chaekit.domain.highlight.entity.reaction.HighlightReaction;
import qwerty.chaekit.dto.highlight.reaction.ReactionResponse;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public record CommentResponse(
    Long id,
    Long authorId,
    String authorName,
    String content,
    LocalDateTime createdAt,
    LocalDateTime updatedAt,
    List<CommentResponse> replies,
    List<ReactionResponse> reactions
) {
    public static CommentResponse of(HighlightComment comment) {
        return of(comment, Collections.emptyMap());
    }
    
    public static CommentResponse of(HighlightComment comment, Map<Long, List<HighlightReaction>> reactionsByCommentId) {
        List<CommentResponse> replies = comment.getReplies().stream()
                .map(reply -> of(reply, reactionsByCommentId))
                .collect(Collectors.toList());

        List<ReactionResponse> reactions = reactionsByCommentId.getOrDefault(comment.getId(), Collections.emptyList())
                .stream()
                .map(ReactionResponse::of)
                .collect(Collectors.toList());
                
        return new CommentResponse(
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