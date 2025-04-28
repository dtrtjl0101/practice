package qwerty.chaekit.domain.group;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface GroupMemberRepository extends JpaRepository<GroupMember, Long> {
    @Query("SELECT gm FROM GroupMember gm JOIN FETCH gm.user WHERE gm.readingGroup = :readingGroup AND gm.isAccepted = false")
    Page<GroupMember> findByReadingGroupAndIsAcceptedFalse(ReadingGroup readingGroup, Pageable pageable);
}
