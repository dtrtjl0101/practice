package qwerty.chaekit.domain.ebook.purchase.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;
import qwerty.chaekit.domain.ebook.purchase.EbookPurchase;

@Repository
public interface EbookPurchaseRepository {
    EbookPurchase save(EbookPurchase ebook);
    Page<EbookPurchase> findByUserIdWithEbook(Long userId, Pageable pageable);
    boolean existsByUserIdAndEbookId(Long userId, Long ebookId);
}
