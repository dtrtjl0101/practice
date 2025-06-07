package qwerty.chaekit.domain.group.activity.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import qwerty.chaekit.domain.group.activity.Activity;
import qwerty.chaekit.domain.group.activity.dto.ActivityScoreDto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ActivityRepository extends JpaRepository<Activity, Long> {
    List<Activity> findByGroup_Id(Long groupId);

    @Query("SELECT a FROM Activity a inner JOIN FETCH a.book WHERE a.group.id = :groupId")
    Page<Activity> findByGroup_IdWithBook(@Param("groupId") Long groupId, Pageable pageable);

    @Query("SELECT a FROM Activity a INNER JOIN FETCH a.book WHERE a.id = :activityId")
    Optional<Activity> findByIdWithBook(@Param("activityId") Long activityId);

    long countByCreatedAtAfter(LocalDateTime createdAtAfter);

    List<Activity> findByStartTimeLessThanEqualAndEndTimeGreaterThanEqual(LocalDate start, LocalDate end);

    @Query("""
    SELECT new qwerty.chaekit.domain.group.activity.dto.ActivityScoreDto(
        u,
        COALESCE(COUNT(DISTINCT h.id), 0) * 3 +
        COALESCE(COUNT(DISTINCT hc.id), 0) * 1 +
        COALESCE(COUNT(DISTINCT d.id), 0) * 5 +
        COALESCE(COUNT(DISTINCT dc.id), 0) * 2
    )
    FROM ActivityMember am
    JOIN am.user u
    LEFT JOIN Highlight h ON h.author.id = u.id AND h.activity.id = :activityId
    LEFT JOIN HighlightComment hc ON hc.author.id = u.id
        AND hc.highlight.id IN (
            SELECT h2.id FROM Highlight h2 WHERE h2.activity.id = :activityId
        )
    LEFT JOIN Discussion d ON d.author.id = u.id AND d.activity.id = :activityId
    LEFT JOIN DiscussionComment dc ON dc.author.id = u.id
        AND dc.discussion.id IN (
            SELECT d2.id FROM Discussion d2 WHERE d2.activity.id = :activityId
        )
    WHERE am.activity.id = :activityId
    GROUP BY u
    ORDER BY
        COALESCE(COUNT(DISTINCT h.id), 0) * 3 +
        COALESCE(COUNT(DISTINCT hc.id), 0) * 1 +
        COALESCE(COUNT(DISTINCT d.id), 0) * 5 +
        COALESCE(COUNT(DISTINCT dc.id), 0) * 2 DESC
    """)
    List<ActivityScoreDto> calculateTop5Scores(@Param("activityId") Long activityId, Pageable pageable);

}
