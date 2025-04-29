package qwerty.chaekit.domain.group;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface GroupRepository extends JpaRepository<ReadingGroup, Long> {
    @Query("SELECT g FROM ReadingGroup g JOIN FETCH g.groupMembers m")
    Page<ReadingGroup> findAllWithGroupMembers(Pageable pageable);
    @Query("SELECT g FROM ReadingGroup g JOIN FETCH g.groupMembers m WHERE g.id = :groupId")
    Optional<ReadingGroup> findByIdWithGroupMembers(Long groupId);
}
