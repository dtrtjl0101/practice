package qwerty.chaekit.domain.ebook.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;
import qwerty.chaekit.domain.ebook.Ebook;

import java.util.Optional;

@Repository
public interface EbookRepository {
    Page<Ebook> findAll(Pageable pageable);
    Optional<Ebook> findById(Long id);
    Ebook save(Ebook ebook);
    boolean existsById(Long id);
    Ebook getReferenceById(Long id);
    Page<Ebook> searchEbooks(String authorName, String bookTitle, Pageable pageable);
}
