package qwerty.chaekit.domain.highlight.entity.reaction;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import qwerty.chaekit.domain.BaseEntity;
import qwerty.chaekit.domain.highlight.entity.Highlight;
import qwerty.chaekit.domain.highlight.entity.comment.HighlightComment;
import qwerty.chaekit.domain.member.user.UserProfile;

@Entity
@Getter
@Table(name = "highlight_reaction")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class HighlightReaction extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="author_id")
    private UserProfile author;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="highlight_id")
    private Highlight highlight;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="comment_id")
    private HighlightComment comment;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReactionType reactionType;
    
    @Builder
    public HighlightReaction(UserProfile author, Highlight highlight, HighlightComment comment, ReactionType reactionType) {
        this.author = author;
        this.highlight = highlight;
        this.comment = comment;
        this.reactionType = reactionType;
    }
}