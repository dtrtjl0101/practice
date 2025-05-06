package qwerty.chaekit.domain.group.activity.discussion.repository;

import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;
import qwerty.chaekit.domain.group.activity.discussion.Discussion;
import qwerty.chaekit.domain.group.activity.discussion.QDiscussionComment;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Repository
@RequiredArgsConstructor
public class DiscussionRepositoryImpl implements DiscussionRepository {
    private final DiscussionJpaRepository jpaRepository;
    private final DiscussionCommentJpaRepository commentJpaRepository;
    private final JPAQueryFactory queryFactory;

    @Override
    public Optional<Discussion> findById(Long id) {
        return jpaRepository.findById(id);
    }

    @Override
    public Page<Discussion> findByActivityId(Long activityId, Pageable pageable) {
        return jpaRepository.findByActivity_Id(activityId, pageable);
    }

    @Override
    public Long countCommentsByDiscussionId(Long discussionId) {
        return commentJpaRepository.countByDiscussion_Id(discussionId);
    }

    @Override
    public Optional<Discussion> findByIdWithAuthorAndComments(Long id) {
        return jpaRepository.findByIdWithAuthorAndComments(id);
    }

    @Override
    public Discussion save(Discussion discussion) {
        return jpaRepository.save(discussion);
    }

    @Override
    public void delete(Discussion discussion) {
        jpaRepository.delete(discussion);
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
}
