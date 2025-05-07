package qwerty.chaekit.domain.highlight.entity.comment;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import qwerty.chaekit.domain.BaseEntity;
import qwerty.chaekit.domain.highlight.entity.Highlight;
import qwerty.chaekit.domain.member.user.UserProfile;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Table(name = "highlight_comment")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class HighlightComment extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="author_id")
    private UserProfile author;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="highlight_id")
    private Highlight highlight;

    @Column(nullable = false)
    private String content;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private HighlightComment parent;
    
    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<HighlightComment> replies = new ArrayList<>();
    
    @Builder
    public HighlightComment(UserProfile author, Highlight highlight, String content, HighlightComment parent) {
        this.author = author;
        this.highlight = highlight;
        this.content = content;
        this.parent = parent;
    }
    
    public void updateContent(String comment) {
        this.content = comment;
    }
    
    public void addReply(HighlightComment reply) {
        this.replies.add(reply);
    }
}