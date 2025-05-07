package qwerty.chaekit.domain.highlight.repository.comment;

import org.springframework.data.jpa.repository.JpaRepository;
import qwerty.chaekit.domain.highlight.entity.comment.HighlightComment;

public interface HighlightCommentJpaRepository extends JpaRepository<HighlightComment, Long> {
}
