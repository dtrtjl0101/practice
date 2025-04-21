package qwerty.chaekit.domain.member.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface UserProfileRepository  extends JpaRepository<UserProfile,Long> {
    Optional<UserProfile> findByMember_Id(Long id);
    boolean existsByNickname(String nickname);

    Optional<UserProfile> findByMember_Email(String email);
    @Query("SELECT u FROM UserProfile u JOIN FETCH u.member m WHERE u.id = :userId")
    Optional<UserProfile> findByIdWithMember(Long userId);
}
