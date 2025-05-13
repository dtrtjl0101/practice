package qwerty.chaekit.domain.ebook.repository;

import com.querydsl.core.BooleanBuilder;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;
import qwerty.chaekit.domain.ebook.Ebook;
import qwerty.chaekit.domain.ebook.QEbook;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class EbookRepositoryImpl implements EbookRepository {
    private final JPAQueryFactory jpaQueryFactory;
    private final EbookJpaRepository ebookJpaRepository;

    @Override
    public Page<Ebook> findAllByTitleAndAuthor(String title, String author, Pageable pageable) {
        QEbook ebook = QEbook.ebook;
        BooleanBuilder where = new BooleanBuilder();

        if (author != null && !author.isBlank()) {
            where.and(ebook.author.startsWith(author));
        }
        if (title != null && !title.isBlank()) {
            where.and(ebook.title.contains(title));
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

    @Override
    public Optional<Ebook> findById(Long id) {
        return ebookJpaRepository.findById(id);
    }

    @Override
    public Optional<Ebook> findByIdWithPublisher(Long id) {
        return ebookJpaRepository.findByIdWithPublisher(id);
    }

    @Override
    public Ebook save(Ebook ebook) {
        return ebookJpaRepository.save(ebook);
    }

    @Override
    public boolean existsById(Long id) {
        return ebookJpaRepository.existsById(id);
    }

    @Override
    public Ebook getReferenceById(Long id) {
        return ebookJpaRepository.getReferenceById(id);
    }
}