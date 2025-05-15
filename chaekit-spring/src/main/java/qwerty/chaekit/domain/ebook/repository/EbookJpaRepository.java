package qwerty.chaekit.domain.ebook.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import qwerty.chaekit.domain.ebook.Ebook;

import java.util.Optional;

@Repository
public interface EbookJpaRepository extends JpaRepository<Ebook, Long> {
    @Query("SELECT e FROM Ebook e LEFT JOIN FETCH e.publisher WHERE e.id = :id")
    Optional<Ebook> findByIdWithPublisher(Long id);
} 