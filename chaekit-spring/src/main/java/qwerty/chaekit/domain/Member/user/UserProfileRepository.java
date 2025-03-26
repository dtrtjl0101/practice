package qwerty.chaekit.domain.Member.user;

import org.springframework.data.jpa.repository.JpaRepository;

public interface UserProfileRepository  extends JpaRepository<UserProfile,Long> {
    boolean existsByNickname(String nickname);
}
