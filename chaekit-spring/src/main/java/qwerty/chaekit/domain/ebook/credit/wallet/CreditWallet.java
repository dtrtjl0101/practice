package qwerty.chaekit.domain.ebook.credit.wallet;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import qwerty.chaekit.domain.BaseEntity;
import qwerty.chaekit.domain.ebook.credit.payment.CreditPaymentTransaction;
import qwerty.chaekit.domain.ebook.credit.usage.CreditUsageTransaction;
import qwerty.chaekit.domain.member.user.UserProfile;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Table(name = "credit_wallet")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class CreditWallet extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private UserProfile user;

    @Column(nullable = false)
    private long balance = 0;

    @OneToMany(mappedBy = "wallet", cascade = CascadeType.PERSIST)
    private final List<CreditUsageTransaction> usageTransactions = new ArrayList<>();

    @OneToMany(mappedBy = "wallet", cascade = CascadeType.PERSIST)
    private final List<CreditPaymentTransaction> paymentTransactions = new ArrayList<>();

    @Builder
    public CreditWallet(Long id, UserProfile user) {
        this.id = id;
        this.user = user;
    }

    public void addCredit(long amount) {
        this.balance += amount;
    }

    public void useCredit(long amount) {
        if (this.balance < amount) {
            throw new IllegalArgumentException("Insufficient balance");
        }
        this.balance -= amount;
    }
}
