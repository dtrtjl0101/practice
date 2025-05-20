package qwerty.chaekit.domain.ebook.purchase.repository;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;
import qwerty.chaekit.domain.ebook.Ebook;
import qwerty.chaekit.domain.ebook.purchase.EbookPurchase;
import qwerty.chaekit.domain.member.user.UserProfile;

import java.util.List;
import java.util.Optional;

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
    public Optional<EbookPurchase> findByUserAndEbook(UserProfile user, Ebook ebook) {
        return ebookPurchaseJpaRepository.findByUserAndEbook(user, ebook);
    }

    @Override
    public boolean existsByUserIdAndEbookId(Long userId, Long ebookId) {
        return ebookPurchaseJpaRepository.existsByUser_IdAndEbook_Id(userId, ebookId);
    }

    @Override
    public List<EbookPurchase> findByUserIdIn(List<Long> userIdList) {
        return ebookPurchaseJpaRepository.findByUserIdIn(userIdList);
    }
}