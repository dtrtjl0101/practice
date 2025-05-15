package qwerty.chaekit.domain.highlight.repository;

import com.querydsl.core.BooleanBuilder;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;
import qwerty.chaekit.domain.highlight.entity.Highlight;
import qwerty.chaekit.domain.highlight.entity.QHighlight;

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
        }

        if (!me) { // 내 하이라이트
            where.and(highlight.isPublic.eq(true));
        } else { // 공개된 하이라이트
            where.and(highlight.author.id.eq(userId));
        }

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
    public void delete(Highlight highlight) {
        highlightJpaRepository.delete(highlight);
    }
}
