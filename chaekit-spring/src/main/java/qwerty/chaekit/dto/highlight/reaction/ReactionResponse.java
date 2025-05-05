package qwerty.chaekit.dto.highlight.reaction;

import qwerty.chaekit.domain.highlight.entity.reaction.HighlightReaction;
import qwerty.chaekit.domain.highlight.entity.reaction.ReactionType;

import java.time.LocalDateTime;

public record ReactionResponse(
    Long id,
    Long authorId,
    String authorName,
    ReactionType reactionType,
    String emoji,
    Long commentId,
    LocalDateTime createdAt
) {
    public static ReactionResponse of(HighlightReaction reaction) {
        return new ReactionResponse(
            reaction.getId(),
            reaction.getAuthor().getId(),
            reaction.getAuthor().getNickname(),
            reaction.getReactionType(),
            reaction.getReactionType().getEmoji(),
            reaction.getComment() != null ? reaction.getComment().getId() : null,
            reaction.getCreatedAt()
        );
    }
} 