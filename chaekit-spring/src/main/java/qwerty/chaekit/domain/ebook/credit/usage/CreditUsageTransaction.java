package qwerty.chaekit.domain.ebook.credit.usage;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import qwerty.chaekit.domain.BaseEntity;
import qwerty.chaekit.domain.ebook.credit.wallet.CreditWallet;

@Entity
@Getter
@Table(name = "credit_usage_transaction")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class CreditUsageTransaction extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "wallet_id", nullable = false)
    private CreditWallet wallet;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private CreditUsageTransactionType transactionType;

    @Column(nullable = false)
    private int creditAmount;

    @Builder
    public CreditUsageTransaction(CreditWallet wallet, CreditUsageTransactionType transactionType, int creditAmount) {
        this.wallet = wallet;
        this.transactionType = transactionType;
        this.creditAmount = creditAmount;
    }
}
