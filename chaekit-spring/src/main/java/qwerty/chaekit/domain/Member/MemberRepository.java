package qwerty.chaekit.domain.Member;

import org.springframework.data.jpa.repository.JpaRepository;

public interface MemberRepository extends JpaRepository<Member,Long> {
    Member findByUsername(String username);
    Boolean existsByUsername(String username);
}
