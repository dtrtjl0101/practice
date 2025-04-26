package qwerty.chaekit.domain.ebook;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import qwerty.chaekit.domain.highlight.entity.Highlight;

import java.util.Optional;

@Repository
public interface EbookRepository {
    Optional<Ebook> findById(Long id);
    Ebook save(Ebook ebook);
    boolean existsById(Long id);
    Ebook getReferenceById(Long id);
    Page<Ebook> searchEbooks(String authorName, String bookTitle, Pageable pageable);
}
