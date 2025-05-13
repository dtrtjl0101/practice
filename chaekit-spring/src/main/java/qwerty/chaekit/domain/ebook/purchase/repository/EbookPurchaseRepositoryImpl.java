package qwerty.chaekit.domain.ebook.purchase.repository;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;
import qwerty.chaekit.domain.ebook.purchase.EbookPurchase;

@Repository
@RequiredArgsConstructor
public class EbookPurchaseRepositoryImpl implements EbookPurchaseRepository {
    private final EbookPurchaseJpaRepository ebookPurchaseJpaRepository;

    @Override
    public EbookPurchase save(EbookPurchase ebookPurchase) {
        return ebookPurchaseJpaRepository.save(ebookPurchase);
    }

    @Override
    public Page<EbookPurchase> findByUserIdWithEbook(Long userId, Pageable pageable) {
        return ebookPurchaseJpaRepository.findByUserIdWithEbook(userId, pageable);
    }

    @Override
    public boolean existsByUserIdAndEbookId(Long userId, Long ebookId) {
        return ebookPurchaseJpaRepository.existsByUser_IdAndEbook_Id(userId, ebookId);
    }
}