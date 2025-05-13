package qwerty.chaekit.domain.ebook.credit;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CreditTransactionRepository extends JpaRepository<CreditTransaction, Long> {
    Page<CreditTransaction> getCreditTransactionsByWallet_User_Id(Long walletUserId, Pageable pageable);
}
