package qwerty.chaekit.domain.Member.user;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserProfileRepository  extends JpaRepository<UserProfile,Long> {
    Optional<UserProfile> findByMember_Username(String username);
    boolean existsByNickname(String nickname);
}
