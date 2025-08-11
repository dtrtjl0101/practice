package qwerty.chaekit.service.ebook.credit;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import qwerty.chaekit.domain.ebook.credit.payment.CreditPaymentTransaction;
import qwerty.chaekit.domain.ebook.credit.payment.CreditPaymentTransactionRepository;
import qwerty.chaekit.domain.ebook.credit.payment.CreditPaymentTransactionType;
import qwerty.chaekit.domain.ebook.credit.wallet.CreditWallet;
import qwerty.chaekit.domain.ebook.credit.wallet.CreditWalletRepository;
import qwerty.chaekit.domain.member.user.UserProfile;
import qwerty.chaekit.dto.ebook.credit.CreditProductInfoResponse;
import qwerty.chaekit.dto.ebook.credit.CreditTransactionResponse;
import qwerty.chaekit.dto.ebook.credit.CreditWalletResponse;
import qwerty.chaekit.dto.ebook.credit.payment.CreditPaymentApproveResponse;
import qwerty.chaekit.dto.ebook.credit.payment.CreditPaymentReadyRequest;
import qwerty.chaekit.dto.external.kakaopay.Amount;
import qwerty.chaekit.dto.external.kakaopay.KakaoPayApproveResponse;
import qwerty.chaekit.dto.page.PageResponse;
import qwerty.chaekit.global.constant.CreditProduct;
import qwerty.chaekit.global.security.resolver.UserToken;
import qwerty.chaekit.service.ebook.credit.exception.PaymentCancelFailedException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CreditServiceTest {

    @InjectMocks
    private CreditService creditService;

    @Mock
    private KakaoPayService kakaoPayService;

    @Mock
    private CreditPaymentTransactionRepository creditPaymentTransactionRepository;

    @Mock
    private CreditWalletRepository creditWalletRepository;

    @Test
    @DisplayName("크레딧 상품 목록 조회 성공")
    void getCreditProductList_Success() {
        // when
        List<CreditProductInfoResponse> response = creditService.getCreditProductList();

        // then
        assertThat(response).isNotEmpty();
        assertThat(response).hasSize(CreditProduct.values().length);
        response.forEach(product -> {
            assertThat(product.id()).isNotNull();
            assertThat(product.creditAmount()).isPositive();
            assertThat(product.price()).isPositive();
        });
    }

    @Test
    @DisplayName("카카오페이 결제 요청 성공")
    void requestKakaoPay_Success() {
        // given
        Long userId = 1L;
        UserToken userToken = UserToken.of(userId, userId, "test@test.com");
        CreditPaymentReadyRequest request = new CreditPaymentReadyRequest(1L);

        String redirectUrl = "https://kakaopay.com/payment";

        // when
        when(kakaoPayService.requestKakaoPay(userToken, request)).thenReturn(redirectUrl);

        String response = creditService.requestKakaoPay(userToken, request);

        // then
        assertThat(response).isEqualTo(redirectUrl);
        verify(kakaoPayService).requestKakaoPay(userToken, request);
    }


    @Test
    @DisplayName("카카오페이 결제 승인 실패 - 결제 취소 실패")
    void approveKakaoPayPayment_Failure_CancelFailed() {
        // given
        Long userId = 1L;
        UserToken userToken = UserToken.of(userId, userId, "test@test.com");
        String pgToken = "test-pg-token";

        UserProfile user = mock(UserProfile.class);
        when(user.getId()).thenReturn(userId);

        CreditWallet wallet = mock(CreditWallet.class);
        when(wallet.getUser()).thenReturn(user);
        doThrow(new RuntimeException("지갑 크레딧 추가 실패"))
                .when(wallet).addCredit(anyInt());

        KakaoPayApproveResponse kakaoPayResponse = mock(KakaoPayApproveResponse.class);
        when(kakaoPayResponse.tid()).thenReturn("test-tid");
        when(kakaoPayResponse.partner_order_id()).thenReturn("test-order-id");
        when(kakaoPayResponse.item_code()).thenReturn("1");
        when(kakaoPayResponse.item_name()).thenReturn("test-product");
        when(kakaoPayResponse.payment_method_type()).thenReturn("CARD");
        when(kakaoPayResponse.amount()).thenReturn(new Amount(1000, 0, 0, 0, 0));
        when(kakaoPayResponse.approved_at()).thenReturn(LocalDateTime.now());

        // when
        when(kakaoPayService.approveKakaoPayPayment(userId, pgToken)).thenReturn(kakaoPayResponse);
        when(creditWalletRepository.findByUser_Id(userId)).thenReturn(Optional.of(wallet));
        when(creditWalletRepository.existsByUserAndPaymentTransactionsEmpty(user)).thenReturn(false);

        doThrow(new PaymentCancelFailedException("결제 취소에 실패했습니다"))
                .when(kakaoPayService).cancelKakaoPayPayment(anyString(), anyLong());

        // then
        assertThatThrownBy(() -> creditService.approveKakaoPayPayment(userToken, pgToken))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("결제 취소에 실패했습니다. 고객센터에 문의해주세요.");
    }

    @Test
    @DisplayName("내 지갑 조회 성공")
    void getMyWallet_Success() {
        // given
        Long userId = 1L;
        UserToken userToken = UserToken.of(userId, userId, "test@test.com");

        CreditWallet wallet = mock(CreditWallet.class);
        when(wallet.getId()).thenReturn(1L);
        when(wallet.getBalance()).thenReturn(1000L);

        // when
        when(creditWalletRepository.findByUser_Id(userId)).thenReturn(Optional.of(wallet));

        CreditWalletResponse response = creditService.getMyWallet(userToken);

        // then
        assertThat(response.walletId()).isEqualTo(wallet.getId());
        assertThat(response.balance()).isEqualTo(wallet.getBalance());
    }

    @Test
    @DisplayName("내 지갑 거래 내역 조회 성공")
    void getMyWalletTransactions_Success() {
        // given
        Long userId = 1L;
        UserToken userToken = UserToken.of(userId, userId, "test@test.com");
        Pageable pageable = PageRequest.of(0, 10);

        CreditPaymentTransaction transaction = mock(CreditPaymentTransaction.class);
        when(transaction.getOrderId()).thenReturn("test-order-id");
        when(transaction.getCreditProductId()).thenReturn(1);
        when(transaction.getCreditProductName()).thenReturn("test-product");
        when(transaction.getTransactionType()).thenReturn(CreditPaymentTransactionType.CHARGE);
        when(transaction.getCreditAmount()).thenReturn(1000);
        when(transaction.getPaymentAmount()).thenReturn(1000);
        when(transaction.getApprovedAt()).thenReturn(LocalDateTime.now());

        // when
        when(creditPaymentTransactionRepository.getCreditTransactionsByWallet_User_Id(userId, pageable))
                .thenReturn(new PageImpl<>(List.of(transaction)));

        PageResponse<CreditTransactionResponse> response = creditService.getMyWalletTransactions(userToken, pageable);

        // then
        assertThat(response.content()).hasSize(1);
        CreditTransactionResponse transactionResponse = response.content().get(0);
        assertThat(transactionResponse.orderId()).isEqualTo(transaction.getOrderId());
        assertThat(transactionResponse.productId()).isEqualTo(transaction.getCreditProductId());
        assertThat(transactionResponse.productName()).isEqualTo(transaction.getCreditProductName());
        assertThat(transactionResponse.type()).isEqualTo(transaction.getTransactionType());
        assertThat(transactionResponse.creditAmount()).isEqualTo(transaction.getCreditAmount());
        assertThat(transactionResponse.paymentAmount()).isEqualTo(transaction.getPaymentAmount());
        assertThat(transactionResponse.approvedAt()).isEqualTo(transaction.getApprovedAt());
    }
} 