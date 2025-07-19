package qwerty.chaekit.service.ebook;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
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
import qwerty.chaekit.service.util.FileService;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EbookPurchaseServiceTest {

    @InjectMocks
    private EbookPurchaseService ebookPurchaseService;

    @Mock
    private CreditUsageTransactionRepository creditUsageTransactionRepository;

    @Mock
    private EbookPurchaseRepository ebookPurchaseRepository;

    @Mock
    private UserProfileRepository userRepository;

    @Mock
    private CreditWalletRepository creditWalletRepository;

    @Mock
    private EbookRepository ebookRepository;

    @Mock
    private FileService fileService;

    //    @Test
    //    @DisplayName("이북 구매 성공")
    //    void purchaseEbook_Success() {
    //        // given
    //        Long userId = 1L;
    //        Long ebookId = 1L;
    //        int price = 1000;
    //
    //        UserProfile user = UserProfile.builder()
    //                .id(userId)
    //                .build();
    //        Ebook ebook = Ebook.builder()
    //                .id(ebookId)
    //                .title("Test Book")
    //                .author("Test Author")
    //                .price(price)
    //                .fileKey("test-file-key")
    //                .coverImageKey("test-cover-key")
    //                .build();
    //
    //        CreditWallet wallet = CreditWallet.builder()
    //                .id(1L)
    //                .user(user)
    //                .build();
    //        wallet.addCredit(2000);
    //
    //        CreditUsageTransaction transaction = CreditUsageTransaction.builder()
    //                .wallet(wallet)
    //                .creditAmount(price)
    //                .transactionType(CreditUsageTransactionType.PURCHASE)
    //                .build();
    //
    //        EbookPurchase purchase = EbookPurchase.builder()
    //                .user(user)
    //                .ebook(ebook)
    //                .transaction(transaction)
    //                .build();
    //
    //        // when
    //        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
    //        when(creditWalletRepository.findByUser_Id(userId)).thenReturn(Optional.of(wallet));
    //        when(ebookPurchaseRepository.existsByUserIdAndEbookId(userId, ebookId)).thenReturn(false);
    //        when(creditUsageTransactionRepository.save(any())).thenReturn(transaction);
    //        when(ebookPurchaseRepository.save(any())).thenReturn(purchase);
    //        when(fileService.getEbookDownloadUrl(any())).thenReturn("http://test.com/download");
    //
    //
    //        // then
    //        verify(creditUsageTransactionRepository).save(any());
    //        verify(ebookPurchaseRepository).save(any());
    //    }

//    @Test
//    @DisplayName("이북 구매 실패 - 이미 구매한 이북")
//    void purchaseEbook_Failure_AlreadyPurchased() {
//        // given
//        Long userId = 1L;
//        Long ebookId = 1L;
//
//        UserProfile user = UserProfile.builder()
//                .id(userId)
//                .build();
//
//        CreditWallet wallet = CreditWallet.builder()
//                .id(1L)
//                .user(user)
//                .build();
//
//        Ebook ebook = Ebook.builder()
//                .id(ebookId)
//                .price(1000)
//                .build();
//
//        // when
//        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
//        when(creditWalletRepository.findByUser_Id(userId)).thenReturn(Optional.of(wallet));
//        when(ebookPurchaseRepository.existsByUserIdAndEbookId(userId, ebookId)).thenReturn(true);
//
//        // then
//        assertThatThrownBy(() -> ebookPurchaseService.purchaseEbook(ebookId, userId))
//                .isInstanceOf(BadRequestException.class)
//                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.EBOOK_ALREADY_PURCHASED.getCode());
//    }

//    @Test
//    @DisplayName("이북 구매 실패 - 크레딧 부족")
//    void purchaseEbook_Failure_InsufficientCredit() {
//        // given
//        Long userId = 1L;
//        Long ebookId = 1L;
//
//        UserProfile user = UserProfile.builder()
//                .id(userId)
//                .build();
//
//        CreditWallet wallet = CreditWallet.builder()
//                .id(1L)
//                .user(user)
//                .build();
//
//        Ebook ebook = Ebook.builder()
//                .id(ebookId)
//                .price(1000)
//                .build();
//
//        // when
//        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
//        when(creditWalletRepository.findByUser_Id(userId)).thenReturn(Optional.of(wallet));
//        when(ebookRepository.findByIdWithPublisher(ebookId)).thenReturn(Optional.of(ebook));
//        when(ebookPurchaseRepository.existsByUserIdAndEbookId(userId, ebookId)).thenReturn(false);
//
//        // then
//        assertThatThrownBy(() -> ebookPurchaseService.purchaseEbook(ebookId, userId))
//                .isInstanceOf(BadRequestException.class)
//                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.CREDIT_NOT_ENOUGH.getCode());
//    }

    @Test
    @DisplayName("내 서재 조회 성공")
    void getMyBooks_Success() {
        // given
        Long userId = 1L;
        Pageable pageable = PageRequest.of(0, 10);

        UserProfile user = UserProfile.builder()
                .id(userId)
                .build();

        Ebook ebook = Ebook.builder()
                .id(1L)
                .title("Test Book")
                .author("Test Author")
                .coverImageKey("test-cover-key")
                .build();

        EbookPurchase purchase = EbookPurchase.builder()
                .user(user)
                .ebook(ebook)
                .build();

        // when
        when(ebookPurchaseRepository.findByUserIdWithEbook(userId, pageable))
                .thenReturn(new PageImpl<>(List.of(purchase)));
        when(fileService.convertToPublicImageURL(any())).thenReturn("http://test.com/cover.jpg");

        PageResponse<EbookFetchResponse> response = ebookPurchaseService.getMyBooks(userId, pageable);

        // then
        assertThat(response.content()).hasSize(1);
        assertThat(response.content().get(0).title()).isEqualTo("Test Book");
        assertThat(response.content().get(0).author()).isEqualTo("Test Author");
        assertThat(response.content().get(0).bookCoverImageURL()).isEqualTo("http://test.com/cover.jpg");
        assertThat(response.content().get(0).isPurchased()).isTrue();
    }
} 