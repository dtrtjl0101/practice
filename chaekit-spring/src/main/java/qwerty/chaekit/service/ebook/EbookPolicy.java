package qwerty.chaekit.service.ebook;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import qwerty.chaekit.domain.ebook.Ebook;
import qwerty.chaekit.domain.ebook.purchase.repository.EbookPurchaseRepository;
import qwerty.chaekit.domain.member.user.UserProfile;
import qwerty.chaekit.global.enums.ErrorCode;
import qwerty.chaekit.global.exception.ForbiddenException;
import qwerty.chaekit.service.member.admin.AdminService;

@Service
@RequiredArgsConstructor
public class EbookPolicy {
    private final EbookPurchaseRepository ebookPurchaseRepository;
    private final AdminService adminService;

    public void assertEBookPurchased(UserProfile user, Ebook ebook) {
        if (ebookPurchaseRepository.existsByUserIdAndEbookId(user.getId(), ebook.getId())
                || user.getId().equals(adminService.getAdminUserId())) {
            throw new ForbiddenException(ErrorCode.EBOOK_NOT_PURCHASED);
        }
    }
}
