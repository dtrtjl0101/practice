package qwerty.chaekit.domain.group;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import qwerty.chaekit.domain.member.user.UserProfile;

@Entity
@Getter
@Table(name = "group_member")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class GroupMember {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", nullable = false)
    private ReadingGroup readingGroup;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name ="user_id", nullable = false)
    private UserProfile user;

    @Column(name = "is_accepted", nullable = false)
    private boolean accepted = false;

    @Builder
    public GroupMember(ReadingGroup readingGroup, UserProfile user) {
        this.readingGroup = readingGroup;
        this.user = user;
        this.accepted = false;  // 초기에는 미승인 상태
    }

    public ReadingGroup getGroup() {
        return this.readingGroup;
    }

    public UserProfile getMember() {
        return this.user;
    }

    public void approve() {
        this.accepted = true;
    }

    public void reject() {
        this.accepted = false;
    }

}
