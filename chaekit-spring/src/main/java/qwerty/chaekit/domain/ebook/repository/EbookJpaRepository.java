package qwerty.chaekit.domain.ebook.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import qwerty.chaekit.domain.ebook.Ebook;

@Repository
public interface EbookJpaRepository extends JpaRepository<Ebook, Long> {
} 