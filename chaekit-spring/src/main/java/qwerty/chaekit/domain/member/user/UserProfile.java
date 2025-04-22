package qwerty.chaekit.domain.member.user;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import qwerty.chaekit.domain.BaseEntity;
import qwerty.chaekit.domain.group.GroupMember;
import qwerty.chaekit.domain.member.Member;

import java.util.List;

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

    @OneToMany(mappedBy = "user")
    private List<GroupMember> groups;

    @Builder
    public UserProfile(Member member, String nickname) {
        this.member = member;
        this.nickname = nickname;
    }
}
