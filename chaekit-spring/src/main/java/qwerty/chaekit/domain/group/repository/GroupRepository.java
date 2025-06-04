package qwerty.chaekit.domain.group.repository;

import jakarta.validation.constraints.NotBlank;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import qwerty.chaekit.domain.group.ReadingGroup;

import java.util.List;
import java.util.Optional;

public interface GroupRepository extends JpaRepository<ReadingGroup, Long> {
    @Query("SELECT g FROM ReadingGroup g LEFT JOIN FETCH g.groupTags WHERE g.id = :groupId")
    Optional<ReadingGroup> findByIdWithTags(Long groupId);

    @Query("SELECT g FROM ReadingGroup g JOIN g.groupMembers gm WHERE gm.user.id = :userId AND gm.accepted = TRUE")
    Page<ReadingGroup> findAllByUserId(Long userId, Pageable pageable);

    @Query("SELECT g FROM ReadingGroup g WHERE g.groupLeader.id = :userId")
    Page<ReadingGroup> findByGroupLeaderId(Long userId, Pageable pageable);

    boolean existsReadingGroupByName(@NotBlank String name);

    // Querydsl을 사용하면 더 간단하게 처리할 수 있지만, 여기서는 JpaRepository를 유지하여 구현
    @Query("""
    SELECT g FROM ReadingGroup g
    LEFT JOIN g.groupMembers gm WITH gm.accepted = true
    JOIN g.groupTags t
    WHERE t.tagName IN :tags
    GROUP BY g
    ORDER BY COUNT(gm) DESC
    """)
    Page<ReadingGroup> findAllByTagsInOrderByMemberCountDesc(
            List<String> tags,
            Pageable pageable
    );

    @Query("""
    SELECT g FROM ReadingGroup g
    LEFT JOIN g.groupMembers gm WITH gm.accepted = true
    GROUP BY g
    ORDER BY COUNT(gm) DESC
    """)
    Page<ReadingGroup> findAllOrderByMemberCountDesc(Pageable pageable);

    @Query("""
    SELECT g FROM ReadingGroup g
    JOIN g.groupTags t
    WHERE t.tagName IN :tags
    GROUP BY g
    """)
    Page<ReadingGroup> findAllByTagsIn(
            List<String> tags,
            Pageable pageable
    );
    
    // Page<ReadingGroup> findAll(Pageable pageable);
}
