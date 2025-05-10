package qwerty.chaekit.domain.ebook.credit;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import qwerty.chaekit.domain.BaseEntity;

@Entity
@Getter
@Table(name = "credit_transaction")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class CreditTransaction extends BaseEntity {
    @Id
    @GeneratedValue
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "wallet_id", nullable = false)
    private CreditWallet wallet;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private CreditTransactionType creditTransactionType;



    @Column(nullable = false)
    private long balance = 0;
}
