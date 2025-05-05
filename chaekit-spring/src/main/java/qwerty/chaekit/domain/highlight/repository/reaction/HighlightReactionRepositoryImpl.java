package qwerty.chaekit.domain.highlight.repository.reaction;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import qwerty.chaekit.domain.highlight.entity.reaction.HighlightReaction;
import qwerty.chaekit.domain.highlight.entity.reaction.ReactionType;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class HighlightReactionRepositoryImpl implements HighlightReactionRepository {
    private final HighlightReactionJpaRepository reactionJpaRepository;

    @Override
    public HighlightReaction save(HighlightReaction reaction) {
        return reactionJpaRepository.save(reaction);
    }

    @Override
    public void delete(HighlightReaction reaction) {
        reactionJpaRepository.delete(reaction);
    }

    @Override
    public Optional<HighlightReaction> findById(Long id) {
        return reactionJpaRepository.findById(id);
    }

    @Override
    public List<HighlightReaction> findByCommentId(Long commentId) {
        return reactionJpaRepository.findByCommentId(commentId);
    }

    @Override
    public List<HighlightReaction> findByCommentIdIn(List<Long> commentIds) {
        return reactionJpaRepository.findByCommentIdIn(commentIds);
    }

    @Override
    public List<HighlightReaction> findByHighlightId(Long highlightId) {
        return reactionJpaRepository.findByHighlightId(highlightId);
    }

    @Override
    public Optional<HighlightReaction> findByAuthorIdAndCommentId(Long authorId, Long commentId) {
        return reactionJpaRepository.findByAuthorIdAndCommentId(authorId, commentId);
    }

    @Override
    public Optional<HighlightReaction> findByAuthorIdAndCommentIdAndReactionType(Long authorId, Long commentId, ReactionType reactionType) {
        return reactionJpaRepository.findByAuthorIdAndCommentIdAndReactionType(authorId, commentId, reactionType);
    }
} 