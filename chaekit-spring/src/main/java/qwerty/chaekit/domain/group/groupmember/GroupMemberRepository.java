package qwerty.chaekit.domain.group.groupmember;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import qwerty.chaekit.domain.group.ReadingGroup;
import qwerty.chaekit.domain.member.user.UserProfile;

import java.util.Optional;

@Repository
public interface GroupMemberRepository extends JpaRepository<GroupMember, Long> {
    Page<GroupMember> findByReadingGroupAndAcceptedFalse(ReadingGroup group, Pageable pageable);
    Optional<GroupMember> findByUserAndReadingGroupAndAcceptedTrue(UserProfile user, ReadingGroup group);
}
