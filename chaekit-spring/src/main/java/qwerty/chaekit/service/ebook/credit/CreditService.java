package qwerty.chaekit.service.ebook.credit;

import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import qwerty.chaekit.dto.ebook.credit.CreditProductInfoResponse;
import qwerty.chaekit.dto.ebook.credit.CreditTransactionResponse;
import qwerty.chaekit.dto.ebook.credit.CreditWalletResponse;
import qwerty.chaekit.dto.ebook.credit.payment.CreditPaymentReadyRequest;
import qwerty.chaekit.dto.page.PageResponse;
import qwerty.chaekit.global.constant.CreditProduct;
import qwerty.chaekit.global.security.resolver.UserToken;

import java.util.Arrays;
import java.util.List;

@Service
@Transactional
public class CreditService {
    public List<CreditProductInfoResponse> getCreditProductList() {
        return Arrays.stream(CreditProduct.values())
                .map(
                creditProduct -> CreditProductInfoResponse.builder()
                        .id(creditProduct.getId())
                        .creditAmount(creditProduct.getCreditAmount())
                        .price(creditProduct.getPrice())
                        .build()
                ).toList();
    }

    public CreditWalletResponse getMyWallet(UserToken userToken) {
        return null;
    }

    public PageResponse<CreditTransactionResponse> getMyWalletTransactions(UserToken userToken, Pageable pageable) {
        return null;
    }

    public String requestKakaoPay(UserToken userToken, CreditPaymentReadyRequest request) {
        // TODO: 카카오페이 /v1/payment/ready 호출 후 redirect URL 반환
        return null;
    }

    public String approveKakaoPayPayment(String pgToken) {
        // TODO: KakaoPay /v1/payment/approve 호출
        // TODO: 결제 내역 검증 후 크레딧 지급 처리
        return null;
    }
}
