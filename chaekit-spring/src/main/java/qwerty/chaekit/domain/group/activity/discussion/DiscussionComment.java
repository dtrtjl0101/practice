package qwerty.chaekit.domain.group.activity.discussion;


import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.BatchSize;
import qwerty.chaekit.domain.BaseEntity;
import qwerty.chaekit.domain.member.user.UserProfile;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Table(name = "discussion_comment")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class DiscussionComment extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id")
    private UserProfile author;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "discussion_id")
    private Discussion discussion;

    @Column(nullable = false)
    private String content;

    @Column(nullable = false)
    private boolean isDeleted = false;

    @Column(nullable = false)
    private boolean isEdited = false;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private DiscussionStance stance = DiscussionStance.NEUTRAL;

    @Setter
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private DiscussionComment parent = null;

    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL)
    @BatchSize(size = 50)
    private List<DiscussionComment> replies = new ArrayList<>();

    public void addReply(DiscussionComment reply) {
        if (parent != null) {
            throw new IllegalStateException("Cannot add a reply to a reply.");
        }
        replies.add(reply);
        reply.setParent(this);
    }
}
