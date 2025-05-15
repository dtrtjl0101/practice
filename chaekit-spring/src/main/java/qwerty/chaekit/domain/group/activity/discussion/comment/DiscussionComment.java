package qwerty.chaekit.domain.group.activity.discussion.comment;


import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.BatchSize;
import qwerty.chaekit.domain.BaseEntity;
import qwerty.chaekit.domain.group.activity.discussion.Discussion;
import qwerty.chaekit.domain.group.activity.discussion.DiscussionStance;
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

    @Column(nullable = false, length = 5000)
    private String content;

    @Column(name = "is_edited", nullable = false)
    private boolean edited = false;

    @Column(name = "is_deleted", nullable = false)
    private boolean deleted = false;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private DiscussionStance stance = DiscussionStance.NEUTRAL;

    @Setter
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private DiscussionComment parent = null;

    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL)
    @BatchSize(size = 50)
    private final List<DiscussionComment> replies = new ArrayList<>();

    @Builder
    public DiscussionComment(Long id, UserProfile author, Discussion discussion, String content, DiscussionStance stance, DiscussionComment parent) {
        this.id = id;
        this.author = author;
        this.discussion = discussion;
        this.content = content;
        this.stance = stance;
        this.parent = parent;
    }

    public void updateContent(String content) {
        this.content = content;
        this.edited = true;
    }

    public void softDelete() {
        this.content = "삭제된 댓글입니다.";
        this.deleted = true;
    }
    
    public boolean isAuthor(UserProfile user) {
        return author.getId().equals(user.getId());
    }
    
    public boolean isReply() {
        return parent != null;
    }
    
    public boolean isRootComment() {
        return parent == null;
    }
}
