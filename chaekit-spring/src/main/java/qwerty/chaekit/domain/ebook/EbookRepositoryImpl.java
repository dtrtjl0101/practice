package qwerty.chaekit.domain.ebook;

import com.querydsl.core.BooleanBuilder;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;
import qwerty.chaekit.domain.ebook.QEbook;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class EbookRepositoryImpl implements EbookRepository {
    private final JPAQueryFactory jpaQueryFactory;
    private final EbookJpaRepository ebookJpaRepository;

    @Override
    public Page<Ebook> searchEbooks(String authorName, String bookTitle, Pageable pageable) {
        QEbook ebook = QEbook.ebook;
        BooleanBuilder where = new BooleanBuilder();

        if (authorName != null && !authorName.isEmpty()) {
            where.and(ebook.author.contains(authorName));
        }
        if (bookTitle != null && !bookTitle.isEmpty()) {
            where.and(ebook.title.contains(bookTitle));
        }

        List<Ebook> result = jpaQueryFactory
                .selectFrom(ebook)
                .where(where)
                .offset(pageable.getOffset())
                .limit(pageable.getPageSize())
                .fetch();

        long total = Optional.ofNullable(jpaQueryFactory
                .select(ebook.count())
                .from(ebook)
                .where(where)
                .fetchOne()).orElse(0L);

        return new PageImpl<>(result, pageable, total);
    }
}