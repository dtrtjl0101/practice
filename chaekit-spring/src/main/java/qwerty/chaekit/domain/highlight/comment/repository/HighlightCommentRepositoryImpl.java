package qwerty.chaekit.domain.highlight.comment.repository;

import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import qwerty.chaekit.domain.highlight.comment.HighlightComment;
import qwerty.chaekit.domain.highlight.comment.QHighlightComment;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor

public class HighlightCommentRepositoryImpl implements HighlightCommentRepository{
    private final HighlightCommentJpaRepository commentJpaRepository;
    private final JPAQueryFactory queryFactory;

    @Override
    public HighlightComment save(HighlightComment comment) {
        return commentJpaRepository.save(comment);
    }

    @Override
    public void delete(HighlightComment comment) {
        commentJpaRepository.delete(comment);
    }

    @Override
    public Optional<HighlightComment> findById(Long id) {
        return commentJpaRepository.findById(id);
    }

    @Override
    public List<HighlightComment> findRootCommentsByHighlightId(Long highlightId) {
        QHighlightComment comment = QHighlightComment.highlightComment;

        return queryFactory
                .selectFrom(comment)
                .where(
                        comment.highlight.id.eq(highlightId),
                        comment.parent.isNull()
                )
                .orderBy(comment.createdAt.asc())
                .fetch();
    }
}
