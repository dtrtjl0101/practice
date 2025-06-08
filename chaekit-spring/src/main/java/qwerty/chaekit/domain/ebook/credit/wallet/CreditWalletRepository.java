package qwerty.chaekit.domain.ebook.credit.wallet;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CreditWalletRepository extends JpaRepository<CreditWallet, Long> {
    Optional<CreditWallet> findByUser_Id(Long userId);
}
