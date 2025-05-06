package qwerty.chaekit.domain.group.activity.discussion.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import qwerty.chaekit.domain.group.activity.discussion.Discussion;

import java.util.Optional;


public interface DiscussionJpaRepository extends JpaRepository<Discussion, Long> {
    @Query("SELECT d FROM Discussion d JOIN FETCH d.author WHERE d.activity.id = :activityId")
    Page<Discussion> findByActivity_Id(Long activityId, Pageable pageable);
    @Query("SELECT d FROM Discussion d JOIN FETCH d.author LEFT JOIN FETCH d.comments WHERE d.id = :id")
    Optional<Discussion> findByIdWithAuthorAndComments(Long id);
}
