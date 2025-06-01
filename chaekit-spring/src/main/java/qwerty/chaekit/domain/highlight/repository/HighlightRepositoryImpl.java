package qwerty.chaekit.domain.highlight.repository;

import com.querydsl.core.BooleanBuilder;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;
import qwerty.chaekit.domain.group.ReadingGroup;
import qwerty.chaekit.domain.group.activity.Activity;
import qwerty.chaekit.domain.highlight.Highlight;
import qwerty.chaekit.domain.highlight.QHighlight;
import qwerty.chaekit.domain.member.user.UserProfile;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class HighlightRepositoryImpl implements HighlightRepository {
    private final HighlightJpaRepository highlightJpaRepository;
    private final JPAQueryFactory jpaQueryFactory;

    @Override
    public Optional<Highlight> findById(Long id) {
        return highlightJpaRepository.findById(id);
    }

    @Override
    public Highlight save(Highlight highlight) {
        return highlightJpaRepository.save(highlight);
    }

    @Override
    public Page<Highlight> findHighlights(Pageable pageable, Long userId, Long activityId, Long bookId, String spine, boolean me) {
        QHighlight highlight = QHighlight.highlight;
        BooleanBuilder where = new BooleanBuilder();

        if (bookId != null) {
            where.and(highlight.book.id.eq(bookId));
        }
        if (spine != null) {
            where.and(highlight.spine.eq(spine));
        }

        if (activityId != null) {
            where.and(highlight.activity.id.eq(activityId));
        } else {
            where.and(highlight.isPublic.eq(false));
        }

        if (!me) {// 공개된 하이라이트
            where.and(highlight.isPublic.eq(true));
        } else { // 내 하이라이트
            where.and(highlight.author.id.eq(userId));
        }

        return getHighlightsByBooleanBuilder(pageable, highlight, where);
    }

    @Override
    public void delete(Highlight highlight) {
        highlightJpaRepository.delete(highlight);
    }

    @Override
    public long countByIdsAndActivity(List<Long> ids, Activity activity) {
        return highlightJpaRepository.countByIdsAndActivity(ids, activity);
    }

    @Override
    public Page<Highlight> findByAuthor(UserProfile user, Long bookId, Pageable pageable) {
        QHighlight highlight = QHighlight.highlight;

        BooleanBuilder where = new BooleanBuilder();
        where.and(highlight.author.eq(user));
        if(bookId != null) {
            where.and(highlight.book.id.eq(bookId));
        }

        return getHighlightsByBooleanBuilder(pageable, highlight, where);
    }

    private PageImpl<Highlight> getHighlightsByBooleanBuilder(Pageable pageable, QHighlight highlight, BooleanBuilder where) {
        List<Highlight> result = jpaQueryFactory
                .selectFrom(highlight)
                .leftJoin(highlight.author).fetchJoin()
                .where(where)
                .offset(pageable.getOffset())
                .limit(pageable.getPageSize())
                .fetch();

        long total = Optional.ofNullable(jpaQueryFactory
                .select(highlight.count())
                .from(highlight)
                .where(where)
                .fetchOne()).orElse(0L);

        return new PageImpl<>(result, pageable, total);
    }

    @Override
    public List<Highlight> findByGroup(ReadingGroup group) {
        return highlightJpaRepository.findByActivity_Group(group);
    }
}
