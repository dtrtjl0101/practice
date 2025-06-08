package qwerty.chaekit.dto.highlight.reaction;

import qwerty.chaekit.domain.highlight.reaction.ReactionType;

public record HighlightReactionRequest(
    Long commentId,
    ReactionType reactionType
) {
    // commentId가 없는 경우 (하이라이트에 직접 반응 추가할 때) 사용할 생성자
    public static HighlightReactionRequest ofHighlight(ReactionType reactionType) {
        return new HighlightReactionRequest(null, reactionType);
    }
} 