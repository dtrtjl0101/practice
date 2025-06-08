package qwerty.chaekit.domain.ebook.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import qwerty.chaekit.domain.ebook.Ebook;
import qwerty.chaekit.domain.member.publisher.PublisherProfile;

import java.util.Optional;

@Repository
public interface EbookJpaRepository extends JpaRepository<Ebook, Long> {
    @Query("SELECT e FROM Ebook e LEFT JOIN FETCH e.publisher WHERE e.id = :id")
    Optional<Ebook> findByIdWithPublisher(Long id);
    
    boolean existsByTitle(String title);

    Page<Ebook> findAllByPublisher(PublisherProfile publisher, Pageable pageable);

    @Modifying
    @Query("UPDATE Ebook e SET e.viewCount = e.viewCount + 1 WHERE e.id = :ebookId")
    void incrementViewCount(Long ebookId);

} 