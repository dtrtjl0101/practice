package qwerty.chaekit.domain.highlight.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import qwerty.chaekit.domain.group.activity.Activity;
import qwerty.chaekit.domain.highlight.entity.Highlight;
import qwerty.chaekit.domain.member.user.UserProfile;

import java.util.List;

public interface HighlightJpaRepository extends JpaRepository<Highlight, Long> {
    @Query("SELECT COUNT(h) FROM Highlight h WHERE h.id IN :ids and h.activity = :activity")
    long countByIdsAndActivity(List<Long> ids, Activity activity);
    Page<Highlight> findByAuthor(UserProfile user, Pageable pageable);
}
