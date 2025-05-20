package qwerty.chaekit.domain.group.activity.discussion;


import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.BatchSize;
import qwerty.chaekit.domain.BaseEntity;
import qwerty.chaekit.domain.discussionhighlight.DiscussionHighlight;
import qwerty.chaekit.domain.group.activity.Activity;
import qwerty.chaekit.domain.group.activity.discussion.comment.DiscussionComment;
import qwerty.chaekit.domain.highlight.entity.Highlight;
import qwerty.chaekit.domain.member.user.UserProfile;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Table(name = "discussion")
@NoArgsConstructor(access = lombok.AccessLevel.PROTECTED)
@BatchSize(size = 20)
public class Discussion extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "activity_id")
    private Activity activity;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 5000)
    private String content;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id")
    private UserProfile author;

    @Column(nullable = false)
    private boolean isDebate = false;

    @OneToMany(mappedBy = "discussion")
    private final List<DiscussionComment> comments = new ArrayList<>();

    @OneToMany(mappedBy = "discussion", cascade = CascadeType.ALL, orphanRemoval = true)
    private final List<DiscussionHighlight> highlights = new ArrayList<>();

    @Builder
    public Discussion(Long id, Activity activity, String title, String content, UserProfile author, boolean isDebate) {
        this.id = id;
        this.activity = activity;
        this.title = title;
        this.content = content;
        this.author = author;
        this.isDebate = isDebate;
    }

    public void update(String title, String content) {
        if(title != null) {
            this.title = title;
        }
        if(content != null) {
            this.content = content;
        }
    }
    
    public boolean isAuthor(UserProfile user) {
        return author.getId().equals(user.getId());
    }
    
    public void addComment(DiscussionComment comment) {
        comments.add(comment);
    }

    public void resetHighlights() {
        this.highlights.clear();
    }

    public void addHighlight(Highlight highlight) {
        DiscussionHighlight link = new DiscussionHighlight(this, highlight);
        this.highlights.add(link);
    }
}
