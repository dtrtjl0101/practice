package qwerty.chaekit.domain.highlight.repository.reaction;

import org.springframework.data.jpa.repository.JpaRepository;
import qwerty.chaekit.domain.highlight.entity.reaction.HighlightReaction;
import qwerty.chaekit.domain.highlight.entity.reaction.ReactionType;

import java.util.List;
import java.util.Optional;

public interface HighlightReactionJpaRepository extends JpaRepository<HighlightReaction, Long> {
    List<HighlightReaction> findByCommentId(Long commentId);
    List<HighlightReaction> findByCommentIdIn(List<Long> commentIds);
    List<HighlightReaction> findByHighlightId(Long highlightId);
    Optional<HighlightReaction> findByAuthorIdAndCommentId(Long authorId, Long commentId);
    Optional<HighlightReaction> findByAuthorIdAndCommentIdAndReactionType(Long authorId, Long commentId, ReactionType reactionType);
    Optional<HighlightReaction> findByAuthorIdAndHighlightIdAndReactionTypeAndCommentIdIsNull(Long authorId, Long highlightId, ReactionType reactionType);
    List<HighlightReaction> findByHighlightIdAndCommentIdIsNull(Long highlightId);
} 