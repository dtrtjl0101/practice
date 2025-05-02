package qwerty.chaekit.domain.group;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GroupMemberRepository extends JpaRepository<GroupMember, Long> {
    Page<GroupMember> findByReadingGroupAndAcceptedFalse(ReadingGroup group, Pageable pageable);
}
