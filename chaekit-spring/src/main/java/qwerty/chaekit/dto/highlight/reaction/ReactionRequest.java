package qwerty.chaekit.dto.highlight.reaction;

import qwerty.chaekit.domain.highlight.entity.reaction.ReactionType;

public record ReactionRequest(
    Long commentId,
    ReactionType reactionType
) {
} 