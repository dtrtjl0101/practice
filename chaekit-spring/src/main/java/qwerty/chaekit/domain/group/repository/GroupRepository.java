package qwerty.chaekit.domain.group.repository;

import jakarta.validation.constraints.NotBlank;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import qwerty.chaekit.domain.group.ReadingGroup;

import java.util.Optional;

public interface GroupRepository extends JpaRepository<ReadingGroup, Long> {
    @Query("SELECT g FROM ReadingGroup g LEFT JOIN FETCH g.tags WHERE g.id = :groupId")
    Optional<ReadingGroup> findByIdWithTags(Long groupId);

    @Query("SELECT g FROM ReadingGroup g JOIN g.groupMembers gm WHERE gm.user.id = :userId AND gm.accepted = TRUE")
    Page<ReadingGroup> findAllByUserId(Long userId, Pageable pageable);

    @Query("SELECT g FROM ReadingGroup g WHERE g.groupLeader.id = :userId")
    Page<ReadingGroup> findByGroupLeaderId(Long userId, Pageable pageable);

    boolean existsReadingGroupByName(@NotBlank String name);
}
