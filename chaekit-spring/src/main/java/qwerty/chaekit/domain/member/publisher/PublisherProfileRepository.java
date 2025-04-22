package qwerty.chaekit.domain.member.publisher;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PublisherProfileRepository extends JpaRepository<PublisherProfile,Long> {
    Optional<PublisherProfile> findByMember_Id(Long id);
    Optional<PublisherProfile> findByMember_Username(String username);
    boolean existsByPublisherName(String publisherName);
    Page<PublisherProfile> findAllByAcceptedFalseOrderByCreatedAtDesc(Pageable pageable);
}
