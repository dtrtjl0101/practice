package qwerty.chaekit.domain.member.user;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.BatchSize;
import qwerty.chaekit.domain.BaseEntity;

import qwerty.chaekit.domain.ebook.Ebook;
import qwerty.chaekit.domain.ebook.purchase.EbookPurchase;
import qwerty.chaekit.domain.member.Member;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Table(name = "user_profile")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@BatchSize(size = 50)
public class UserProfile extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, cascade = CascadeType.PERSIST)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @Column(nullable = false)
    private String nickname;

    private String profileImageKey;
    
    @OneToMany(mappedBy = "user")
    @BatchSize(size = 30)
    private final List<EbookPurchase> purchaseList = new ArrayList<>();

    @Builder
    public UserProfile(Long id, Member member, String nickname, String profileImageKey) {
        this.id = id;
        this.member = member;
        this.nickname = nickname;
        this.profileImageKey = profileImageKey;
    }
    
    // 전자책을 조회할때마다 구매 여부를 확인하기 위해 사용하지만, 구매한 전자책이 매우 많아질 경우
    // 성능 저하가 우려된다. 이 경우에는 구매 여부를 확인하는 쿼리를 따로 날리는 것이 좋다.
    public boolean isPurchased(Ebook ebook) {
        return purchaseList
                .stream()
                .anyMatch(purchase -> purchase.getEbook().getId().equals(ebook.getId()));
    }
    
    public boolean isNotAdmin() {
        return !member.isAdmin();
    }
}
