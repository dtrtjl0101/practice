package qwerty.chaekit.domain.ebook.credit;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import qwerty.chaekit.domain.BaseEntity;

import java.time.LocalDateTime;

@Entity
@Getter
@Table(name = "credit_transaction")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class CreditTransaction extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String tid;

    @Column(nullable = false, unique = true)
    private String orderId;

    @Column(nullable = false)
    private int creditProductId;

    @Column(nullable = false)
    private String creditProductName;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "wallet_id", nullable = false)
    private CreditWallet wallet;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private CreditTransactionType transactionType;

    @Column(nullable = false)
    private int creditAmount;

    @Column(nullable = false)
    private int paymentAmount;

    @Column(nullable = false)
    private LocalDateTime approvedAt;

    @Builder
    public CreditTransaction(String tid, String orderId, int creditProductId, String creditProductName,
                           CreditWallet wallet, CreditTransactionType transactionType, int creditAmount,
                           int paymentAmount, LocalDateTime approvedAt) {
        this.tid = tid;
        this.orderId = orderId;
        this.creditProductId = creditProductId;
        this.creditProductName = creditProductName;
        this.wallet = wallet;
        this.transactionType = transactionType;
        this.creditAmount = creditAmount;
        this.paymentAmount = paymentAmount;
        this.approvedAt = approvedAt;
    }
}
