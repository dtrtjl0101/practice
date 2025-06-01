package qwerty.chaekit.domain.highlight.comment.repository;

import qwerty.chaekit.domain.highlight.comment.HighlightComment;

import java.util.List;
import java.util.Optional;

public interface HighlightCommentRepository{
    List<HighlightComment> findRootCommentsByHighlightId(Long highlightId);
    HighlightComment save(HighlightComment highlightComment);
    Optional<HighlightComment> findById(Long id);
    void delete(HighlightComment highlightComment);
} 