package qwerty.chaekit.domain.Member.publisher;

import org.springframework.data.jpa.repository.JpaRepository;

public interface PublisherProfileRepository extends JpaRepository<PublisherProfile,Long> {
    boolean existsByPublisherName(String publisherName);
}
