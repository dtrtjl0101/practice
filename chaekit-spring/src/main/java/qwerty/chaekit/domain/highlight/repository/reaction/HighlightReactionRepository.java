package qwerty.chaekit.domain.highlight.repository.reaction;

import qwerty.chaekit.domain.highlight.entity.reaction.HighlightReaction;

import java.util.List;
import java.util.Optional;

public interface HighlightReactionRepository {
    HighlightReaction save(HighlightReaction reaction);
    void delete(HighlightReaction reaction);
    Optional<HighlightReaction> findById(Long id);
    List<HighlightReaction> findByCommentId(Long commentId);
    List<HighlightReaction> findByCommentIdIn(List<Long> commentIds);
    List<HighlightReaction> findByHighlightId(Long highlightId);
    Optional<HighlightReaction> findByAuthorIdAndCommentId(Long authorId, Long commentId);
} 