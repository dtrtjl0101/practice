package qwerty.chaekit.domain.highlight.comment.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import qwerty.chaekit.domain.highlight.comment.HighlightComment;

public interface HighlightCommentJpaRepository extends JpaRepository<HighlightComment, Long> {
}
