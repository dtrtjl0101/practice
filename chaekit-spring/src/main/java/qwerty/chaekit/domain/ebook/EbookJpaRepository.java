package qwerty.chaekit.domain.ebook;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EbookJpaRepository extends JpaRepository<Ebook, Long> {
} 