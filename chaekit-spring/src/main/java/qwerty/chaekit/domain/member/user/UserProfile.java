package qwerty.chaekit.domain.member.user;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.BatchSize;
import qwerty.chaekit.domain.BaseEntity;
import qwerty.chaekit.domain.ebook.credit.CreditWallet;
import qwerty.chaekit.domain.member.Member;

@Entity
@Getter
@Table(name = "user_profile")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@BatchSize(size = 50)
public class UserProfile extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @Column(nullable = false)
    private String nickname;

    private String profileImageKey;

    @OneToOne(mappedBy = "user")
    private CreditWallet creditWallet;

    @Builder
    public UserProfile(Long id, Member member, String nickname, String profileImageKey) {
        this.id = id;
        this.member = member;
        this.nickname = nickname;
        this.profileImageKey = profileImageKey;
    }
}
