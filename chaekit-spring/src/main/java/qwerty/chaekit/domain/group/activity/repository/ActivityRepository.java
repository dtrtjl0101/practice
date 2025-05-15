package qwerty.chaekit.domain.group.activity.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import qwerty.chaekit.domain.group.activity.Activity;

import java.util.List;
import java.util.Optional;

public interface ActivityRepository extends JpaRepository<Activity, Long> {
    List<Activity> findByGroup_Id(Long groupId);
    Page<Activity> findByGroup_Id(Long groupId, Pageable pageable);

    @Query("SELECT a FROM Activity a inner JOIN FETCH a.book WHERE a.group.id = :groupId")
    Page<Activity> findByGroup_IdWithBook(@Param("groupId") Long groupId, Pageable pageable);

    @Query("SELECT a FROM Activity a INNER JOIN FETCH a.book WHERE a.id = :activityId")
    Optional<Activity> findByIdWithBook(@Param("activityId") Long activityId);
}
