package qwerty.chaekit.domain.group.activity.discussion;


import jakarta.persistence.*;
import lombok.Getter;
import qwerty.chaekit.domain.BaseEntity;
import qwerty.chaekit.domain.member.user.UserProfile;

@Entity
@Getter
public class DiscussionComment extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "author_id")
    private UserProfile author;

    @ManyToOne
    @JoinColumn(name = "discussion_id")
    private Discussion discussion;

    @Column(nullable = false)
    private String content;
}
