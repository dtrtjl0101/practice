package qwerty.chaekit.domain.ebook.credit;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CreditTransactionRepository extends JpaRepository<CreditPaymentTransaction, Long> {
    Page<CreditPaymentTransaction> getCreditTransactionsByWallet_User_Id(Long walletUserId, Pageable pageable);
}
