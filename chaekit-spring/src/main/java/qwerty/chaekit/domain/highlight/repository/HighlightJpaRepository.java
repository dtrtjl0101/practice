package qwerty.chaekit.domain.highlight.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import qwerty.chaekit.domain.group.ReadingGroup;
import qwerty.chaekit.domain.group.activity.Activity;
import qwerty.chaekit.domain.highlight.Highlight;

import java.util.List;

public interface HighlightJpaRepository extends JpaRepository<Highlight, Long> {
    @Query("SELECT COUNT(h) FROM Highlight h WHERE h.id IN :ids and h.activity = :activity")
    long countByIdsAndActivity(List<Long> ids, Activity activity);
    List<Highlight> findByActivity_Group(ReadingGroup activityGroup);

    // 최근 생성된 하이라이트 5개 조회
    List<Highlight> findTop5ByActivityOrderByCreatedAtDesc(Activity activity);
}
