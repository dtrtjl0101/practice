package qwerty.chaekit.domain.member.publisher;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import qwerty.chaekit.domain.member.publisher.enums.PublisherApprovalStatus;

import java.util.Optional;

public interface PublisherProfileRepository extends JpaRepository<PublisherProfile,Long> {
    Optional<PublisherProfile> findByMember_Id(Long id);
    Optional<PublisherProfile> findByMember_Email(String email);
    boolean existsByPublisherName(String publisherName);
    Page<PublisherProfile> findByApprovalStatus(PublisherApprovalStatus approvalStatus, Pageable pageable);
    @Query("SELECT p FROM PublisherProfile p JOIN FETCH p.member m WHERE p.id = :publisherId")
    Optional<PublisherProfile> findByIdWithMember(Long publisherId);
}
