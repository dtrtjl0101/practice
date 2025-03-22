package qwerty.chaekit.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import qwerty.chaekit.domain.User;

public interface UserRepository extends JpaRepository<User,Long> {
    User findByUsername(String username);
}
