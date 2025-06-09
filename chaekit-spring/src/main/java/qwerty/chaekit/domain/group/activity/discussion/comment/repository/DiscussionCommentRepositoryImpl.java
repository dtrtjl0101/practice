package qwerty.chaekit.domain.group.activity.discussion.comment.repository;

import com.querydsl.core.Tuple;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import qwerty.chaekit.domain.group.activity.discussion.DiscussionStance;
import qwerty.chaekit.domain.group.activity.discussion.comment.DiscussionComment;
import qwerty.chaekit.domain.group.activity.discussion.comment.QDiscussionComment;
import qwerty.chaekit.domain.group.activity.discussion.comment.dto.DiscussionCommentCountDto;

import java.util.*;
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
    public Map<Long, DiscussionCommentCountDto> countStanceCommentsByDiscussionIds(List<Long> discussionIds) {
        QDiscussionComment comment = QDiscussionComment.discussionComment;

        List<Tuple> results = queryFactory
                .select(
                        comment.discussion.id,
                        comment.stance,
                        comment.count()
                )
                .from(comment)
                .where(comment.discussion.id.in(discussionIds))
                .groupBy(comment.discussion.id, comment.stance)
                .fetch();

        // 가공: Map<discussionId, Map<stance, count>> → Map<discussionId, DTO>
        Map<Long, Map<DiscussionStance, Long>> grouped = new HashMap<>();
        for (Tuple tuple : results) {
            Long id = tuple.get(comment.discussion.id);
            DiscussionStance stance = tuple.get(comment.stance);
            Long count = tuple.get(comment.count());

            grouped
                    .computeIfAbsent(id, k -> new EnumMap<>(DiscussionStance.class))
                    .put(stance, count);
        }

        return grouped.entrySet().stream()
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        e -> {
                            Map<DiscussionStance, Long> map = e.getValue();
                            long neutral = map.getOrDefault(DiscussionStance.NEUTRAL, 0L);
                            long agree = map.getOrDefault(DiscussionStance.AGREE, 0L);
                            long disagree = map.getOrDefault(DiscussionStance.DISAGREE, 0L);
                            return DiscussionCommentCountDto.ofStanceCounts(neutral, agree, disagree);
                        }
                ));
    }

    @Override
    public Map<Long, DiscussionCommentCountDto> countCommentsByDiscussionIds(List<Long> discussionIds) {
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
                        tuple -> DiscussionCommentCountDto.ofSingle(
                                Optional.ofNullable(tuple.get(comment.count())).orElse(0L)
                        )
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
