package qwerty.chaekit.domain.member.user;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import qwerty.chaekit.domain.BaseEntity;
import qwerty.chaekit.domain.member.Member;

@Entity
@Getter
@Table(name = "user_profile")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class UserProfile extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @Column(nullable = false)
    private String nickname;

    @Builder
    public UserProfile(Long id, Member member, String nickname) {
        this.id = id;
        this.member = member;
        this.nickname = nickname;
    }
}
