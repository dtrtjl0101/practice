package qwerty.chaekit.dto.highlight.reaction;

import qwerty.chaekit.domain.highlight.entity.reaction.HighlightReaction;
import qwerty.chaekit.domain.highlight.entity.reaction.ReactionType;

import java.time.LocalDateTime;

public record HighlightReactionResponse(
    Long id,
    Long authorId,
    String authorName,
    ReactionType reactionType,
    String emoji,
    Long commentId,
    LocalDateTime createdAt
) {
    public static HighlightReactionResponse of(HighlightReaction reaction) {
        return new HighlightReactionResponse(
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