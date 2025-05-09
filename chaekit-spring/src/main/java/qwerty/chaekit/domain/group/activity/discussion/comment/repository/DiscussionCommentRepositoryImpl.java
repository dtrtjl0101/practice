package qwerty.chaekit.domain.group.activity.discussion.comment.repository;

import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import qwerty.chaekit.domain.group.activity.discussion.QDiscussionComment;
import qwerty.chaekit.domain.group.activity.discussion.comment.DiscussionComment;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Repository
@RequiredArgsConstructor
public class DiscussionCommentRepositoryImpl implements DiscussionCommentRepository {
    private final DiscussionCommentJpaRepository commentJpaRepository;
    private final JPAQueryFactory queryFactory;

    @Override
    public DiscussionComment getReferenceById(Long id) {
        return commentJpaRepository.getReferenceById(id);
    }

    @Override
    public boolean existsById(Long id) {
        return commentJpaRepository.existsById(id);
    }

    @Override
    public Optional<DiscussionComment> findById(Long id) {
        return commentJpaRepository.findById(id);
    }

    @Override
    public Optional<DiscussionComment> findByIdWithAuthor(Long id) {
        return commentJpaRepository.findByIdWithAuthor(id);
    }

    @Override
    public DiscussionComment save(DiscussionComment discussionComment) {
        return commentJpaRepository.save(discussionComment);
    }

    @Override
    public void delete(DiscussionComment discussionComment) {
        commentJpaRepository.delete(discussionComment);
    }

    @Override
    public Long countCommentsByDiscussionId(Long discussionId) {
        return commentJpaRepository.countByDiscussion_Id(discussionId);
    }

    @Override
    public Map<Long, Long> countCommentsByDiscussionIds(List<Long> discussionIds) {
        QDiscussionComment comment = QDiscussionComment.discussionComment;
        return queryFactory
                .select(comment.discussion.id, comment.count())
                .from(comment)
                .where(comment.discussion.id.in(discussionIds))
                .groupBy(comment.discussion.id)
                .fetch()
                .stream()
                .collect(Collectors.toMap(
                        tuple -> tuple.get(comment.discussion.id),
                        tuple -> Optional.ofNullable(tuple.get(comment.count())).orElse(0L)
                ));
    }

    @Override
    public Long countByParentId(Long parentId) {
        return commentJpaRepository.countByParent_Id(parentId);
    }

    @Override
    public Optional<DiscussionComment> findByIdWithParent(Long id) {
        return commentJpaRepository.findByIdWithRepliesAndParent(id);
    }
}
