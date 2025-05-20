package qwerty.chaekit.domain.ebook.purchase.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;
import qwerty.chaekit.domain.ebook.Ebook;
import qwerty.chaekit.domain.ebook.purchase.EbookPurchase;
import qwerty.chaekit.domain.member.user.UserProfile;

import java.util.List;
import java.util.Optional;

@Repository
public interface EbookPurchaseRepository {
    EbookPurchase save(EbookPurchase ebook);
    Page<EbookPurchase> findByUserIdWithEbook(Long userId, Pageable pageable);
    Optional<EbookPurchase> findByUserAndEbook(UserProfile user, Ebook ebook);
    boolean existsByUserIdAndEbookId(Long userId, Long ebookId);
    List<EbookPurchase> findByUserIdIn(List<Long> userIdList);
}
