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

    @Builder
    public GroupMember(ReadingGroup readingGroup, UserProfile user) {
        this.readingGroup = readingGroup;
        this.user = user;
    }
}
