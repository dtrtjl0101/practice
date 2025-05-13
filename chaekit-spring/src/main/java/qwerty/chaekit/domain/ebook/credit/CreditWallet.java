package qwerty.chaekit.domain.ebook.credit;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import qwerty.chaekit.domain.BaseEntity;
import qwerty.chaekit.domain.member.user.UserProfile;

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

    public void addCredit(long amount) {
        this.balance += amount;
    }
}
