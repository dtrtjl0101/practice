package qwerty.chaekit.domain.ebook.purchase;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import qwerty.chaekit.domain.BaseEntity;
import qwerty.chaekit.domain.ebook.Ebook;
import qwerty.chaekit.domain.ebook.credit.usage.CreditUsageTransaction;
import qwerty.chaekit.domain.member.user.UserProfile;

@Entity
@Getter
@Table(name = "ebook_purchase")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class EbookPurchase extends BaseEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="book_id")
    private Ebook ebook;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="user_id")
    private UserProfile user;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="credit_usage_transaction_id")
    private CreditUsageTransaction creditUsageTransaction;

    @Column
    private String cfi;

    @Column
    private long percentage = 0L;

    @Builder
    public EbookPurchase(Ebook ebook, UserProfile user, CreditUsageTransaction transaction,String cfi, long percentage) {
        this.ebook = ebook;
        this.user = user;
        this.creditUsageTransaction = transaction;
        this.cfi = cfi;
        this.percentage = percentage;
    }

    public void saveProgress(String cfi, long percentage) {
        this.cfi = cfi;
        this.percentage = percentage;
    }
}
