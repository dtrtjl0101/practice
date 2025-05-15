package qwerty.chaekit.domain.group.repository;

import jakarta.validation.constraints.NotBlank;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import qwerty.chaekit.domain.group.ReadingGroup;

import java.util.Optional;

public interface GroupRepository extends JpaRepository<ReadingGroup, Long> {
    @Query("SELECT DISTINCT g FROM ReadingGroup g LEFT JOIN g.groupMembers gm LEFT JOIN g.tags")
    Page<ReadingGroup> findAllWithGroupMembersAndTags(Pageable pageable);
    @Query("SELECT g FROM ReadingGroup g LEFT JOIN g.groupMembers gm LEFT JOIN g.tags WHERE g.id = :groupId")
    Optional<ReadingGroup> findByIdWithGroupMembersAndTags(Long groupId);

    @Query("SELECT g FROM ReadingGroup g LEFT JOIN g.groupMembers gm LEFT JOIN g.tags WHERE gm.user.id = :userId")
    Page<ReadingGroup> findAllByUserIdWithDetail(Long userId, Pageable pageable);

    @Query("SELECT g FROM ReadingGroup g LEFT JOIN g.groupMembers gm LEFT JOIN g.tags WHERE g.groupLeader.id = :userId")
    Page<ReadingGroup> findByGroupLeaderIdWithDetail(Long userId, Pageable pageable);

    boolean existsReadingGroupByName(@NotBlank String name);
}
