package qwerty.chaekit.domain.ebook.credit.payment;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CreditPaymentTransactionRepository extends JpaRepository<CreditPaymentTransaction, Long> {
    Page<CreditPaymentTransaction> getCreditTransactionsByWallet_User_Id(Long walletUserId, Pageable pageable);
}
