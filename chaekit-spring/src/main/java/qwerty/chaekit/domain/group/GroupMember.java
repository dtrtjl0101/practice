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

    @ManyToOne
    @JoinColumn(name = "group_id", nullable = false)
    private ReadingGroup readingGroup;

    @ManyToOne
    @JoinColumn(name ="user_id", nullable = false)
    private UserProfile user;

    @Column(nullable = false)
    private boolean isAccepted = false;  // 가입 승인 상태

    @Builder
    public GroupMember(ReadingGroup readingGroup, UserProfile user) {
        this.readingGroup = readingGroup;
        this.user = user;
        this.isAccepted = false;  // 초기에는 미승인 상태
    }

    // 그룹 조회
    public ReadingGroup getGroup() {
        return this.readingGroup;
    }

    // 멤버 조회
    public UserProfile getMember() {
        return this.user;
    }

    // 가입 승인
    public void approve() {
        this.isAccepted = true;
    }

    // 가입 거절 또는 취소
    public void reject() {
        this.isAccepted = false;
    }
}
