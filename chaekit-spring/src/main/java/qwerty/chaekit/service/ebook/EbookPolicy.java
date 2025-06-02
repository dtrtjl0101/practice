package qwerty.chaekit.service.ebook;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import qwerty.chaekit.domain.ebook.Ebook;
import qwerty.chaekit.domain.ebook.purchase.repository.EbookPurchaseRepository;
import qwerty.chaekit.domain.member.user.UserProfile;
import qwerty.chaekit.global.enums.ErrorCode;
import qwerty.chaekit.global.exception.ForbiddenException;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class EbookPolicy {
    private final EbookPurchaseRepository ebookPurchaseRepository;

    public void assertEBookPurchased(UserProfile user, Ebook ebook) {
        if (!ebookPurchaseRepository.existsByUserIdAndEbookId(user.getId(), ebook.getId())) {
            throw new ForbiddenException(ErrorCode.EBOOK_NOT_PURCHASED);
        }
    }
}
