package qwerty.chaekit.domain.group;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GroupMemberRepository extends JpaRepository<GroupMember, Long> {
    Page<GroupMember> findByGroupAndAcceptedFalse(ReadingGroup group, Pageable pageable);
}
