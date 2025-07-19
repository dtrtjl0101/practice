package qwerty.chaekit.service.ebook;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import qwerty.chaekit.domain.ebook.Ebook;
import qwerty.chaekit.domain.ebook.credit.usage.CreditUsageTransaction;
import qwerty.chaekit.domain.ebook.credit.usage.CreditUsageTransactionRepository;
import qwerty.chaekit.domain.ebook.credit.usage.CreditUsageTransactionType;
import qwerty.chaekit.domain.ebook.credit.wallet.CreditWallet;
import qwerty.chaekit.domain.ebook.credit.wallet.CreditWalletRepository;
import qwerty.chaekit.domain.ebook.purchase.EbookPurchase;
import qwerty.chaekit.domain.ebook.purchase.repository.EbookPurchaseRepository;
import qwerty.chaekit.domain.ebook.repository.EbookRepository;
import qwerty.chaekit.domain.member.user.UserProfile;
import qwerty.chaekit.domain.member.user.UserProfileRepository;
import qwerty.chaekit.dto.ebook.EbookFetchResponse;
import qwerty.chaekit.dto.ebook.purchase.EbookPurchaseResponse;
import qwerty.chaekit.dto.page.PageResponse;
import qwerty.chaekit.global.enums.ErrorCode;
import qwerty.chaekit.global.exception.BadRequestException;
import qwerty.chaekit.global.exception.NotFoundException;
import qwerty.chaekit.service.util.EntityFinder;
import qwerty.chaekit.service.util.FileService;

@Service
@Transactional
@RequiredArgsConstructor
public class EbookPurchaseService {
    private final CreditUsageTransactionRepository creditUsageTransactionRepository;
    private final EbookPurchaseRepository ebookPurchaseRepository;

    private final UserProfileRepository userRepository;
    private final CreditWalletRepository creditWalletRepository;
    private final EbookRepository ebookRepository;
    private final FileService fileService;
    private final EntityFinder entityFinder;

//    @Transactional
//    public EbookPurchaseResponse purchaseEbook(Long ebookId, Long userId) {
//        UserProfile buyer = userRepository.findById(userId)
//                .orElseThrow(() -> new NotFoundException(ErrorCode.USER_NOT_FOUND));
//        CreditWallet wallet = creditWalletRepository.findByUser_Id(userId)
//                .orElseThrow(() -> new IllegalStateException("크레딧 지갑이 존재하지 않습니다."));
//
//        Ebook ebook = ebookRepository.findByIdWithPublisher(ebookId)
//                .orElseThrow(() -> new NotFoundException(ErrorCode.EBOOK_NOT_FOUND));
//
//        if(ebookPurchaseRepository.existsByUserIdAndEbookId(userId, ebookId)) {
//            throw new BadRequestException(ErrorCode.EBOOK_ALREADY_PURCHASED);
//        }
//
//        int ebookPrice = ebook.getPrice();
//        try {
//            wallet.useCredit(ebookPrice);
//        } catch (Exception e) {
//            throw new BadRequestException(ErrorCode.CREDIT_NOT_ENOUGH);
//        }
//
//        CreditUsageTransaction savedTransaction = creditUsageTransactionRepository.save(
//                CreditUsageTransaction.builder()
//                        .wallet(wallet)
//                        .creditAmount(ebookPrice)
//                        .transactionType(CreditUsageTransactionType.PURCHASE)
//                        .build()
//        );
//
//        ebookPurchaseRepository.save(
//                EbookPurchase.builder()
//                        .user(buyer)
//                        .ebook(ebook)
//                        .transaction(savedTransaction)
//                        .build()
//        );
//
//        return EbookPurchaseResponse.of(
//                userId,
//                ebook,
//                savedTransaction,
//                fileService.getEbookDownloadUrl(ebook.getFileKey())
//        );
//    }

    public PageResponse<EbookFetchResponse> getMyBooks(Long userId, Pageable pageable) {
        Page<EbookPurchase> purchases = ebookPurchaseRepository.findByUserIdWithEbook(userId, pageable);
        return PageResponse.of(
                purchases.map(
                purchase -> EbookFetchResponse.of(
                        purchase.getEbook(),
                        fileService.convertToPublicImageURL(purchase.getEbook().getCoverImageKey()),
                        true
                )));
    }
}
