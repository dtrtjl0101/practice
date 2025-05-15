package qwerty.chaekit.domain.highlight.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import qwerty.chaekit.domain.highlight.entity.Highlight;

import java.util.Optional;

public interface HighlightRepository {
    Optional<Highlight> findById(Long id);
    Highlight save(Highlight highlight);
    Page<Highlight> findHighlights(Pageable pageable, Long userId, Long activityId, Long bookId, String spine, boolean me);
    void delete(Highlight highlight);
}
