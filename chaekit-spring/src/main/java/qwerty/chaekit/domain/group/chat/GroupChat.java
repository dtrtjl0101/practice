package qwerty.chaekit.domain.group.chat;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import qwerty.chaekit.domain.BaseEntity;
import qwerty.chaekit.domain.group.ReadingGroup;
import qwerty.chaekit.domain.member.user.UserProfile;

@Entity
@Getter
@Table(name = "group_chat")
@NoArgsConstructor(access = lombok.AccessLevel.PROTECTED)
public class GroupChat extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id")
    private ReadingGroup group;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id")
    private UserProfile author;

    @Column(nullable = false, length = 1000)
    private String content;

    @Builder
    public GroupChat(ReadingGroup group, UserProfile author, String content) {
        this.group = group;
        this.author = author;
        this.content = content;
    }
}