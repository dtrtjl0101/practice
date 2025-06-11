package qwerty.chaekit.domain.group.activity.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import qwerty.chaekit.domain.group.activity.Activity;
import qwerty.chaekit.domain.group.activity.dto.ActivityScoreDto;
import qwerty.chaekit.domain.group.activity.dto.ActivityWithCountsResponse;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ActivityRepository extends JpaRepository<Activity, Long> {
    List<Activity> findByGroup_Id(Long groupId);

    @Query("""
    SELECT new qwerty.chaekit.domain.group.activity.dto.ActivityWithCountsResponse(
      a,
      (SELECT COUNT(d) FROM Discussion d WHERE d.activity.id = a.id),
      (SELECT COUNT(h) FROM Highlight h WHERE h.activity.id = a.id)
    )
    FROM Activity a
    WHERE a.group.id = :groupId
    """)
    Page<ActivityWithCountsResponse> findByGroupIdWithCounts(Long groupId, Pageable pageable);

    @Query("""
    SELECT new qwerty.chaekit.domain.group.activity.dto.ActivityWithCountsResponse(
      a,
      (SELECT COUNT(d) FROM Discussion d WHERE d.activity.id = a.id),
      (SELECT COUNT(h) FROM Highlight h WHERE h.activity.id = a.id)
    )
    FROM Activity a
    WHERE a.id = :activityId
    """)
    Optional<ActivityWithCountsResponse> findByIdWithCounts(Long activityId);

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

    @Query("""
    SELECT a
    FROM Activity a
    LEFT JOIN ActivityMember am ON a.id = am.activity.id
    WHERE am.user.id = :userId
    ORDER BY am.createdAt DESC
    """)
    List<Activity> findRecentActivityByUserId(@Param("userId") Long userId, Pageable pageable);


}
