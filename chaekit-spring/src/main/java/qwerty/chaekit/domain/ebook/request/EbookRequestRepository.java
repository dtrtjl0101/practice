package qwerty.chaekit.domain.ebook.request;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import qwerty.chaekit.domain.member.publisher.PublisherProfile;

public interface EbookRequestRepository extends JpaRepository<EbookRequest, Long> {
    Page<EbookRequest> findByStatus(EbookRequestStatus status, Pageable pageable);
    Page<EbookRequest> findByPublisher(PublisherProfile publisher, Pageable pageable);
}
