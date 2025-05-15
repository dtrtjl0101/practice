package qwerty.chaekit.domain.group.groupmember;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import qwerty.chaekit.domain.group.ReadingGroup;
import qwerty.chaekit.domain.member.user.UserProfile;

import java.util.Optional;

@Repository
public interface GroupMemberRepository extends JpaRepository<GroupMember, Long> {
    @Query("SELECT gm FROM GroupMember gm JOIN FETCH gm.user WHERE gm.readingGroup = :group AND gm.accepted = false")
    Page<GroupMember> findByPendingMemberWithUser(ReadingGroup group, Pageable pageable);
    Optional<GroupMember> findByUserAndReadingGroupAndAcceptedTrue(UserProfile user, ReadingGroup group);
    @Query("SELECT gm FROM GroupMember gm JOIN FETCH gm.user WHERE gm.readingGroup = :groupId")
    Page<GroupMember> findByReadingGroupId(Long groupId, Pageable pageable);
}
