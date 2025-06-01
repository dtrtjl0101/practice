package qwerty.chaekit.domain.group.activity.discussion.highlight;


import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.BatchSize;
import qwerty.chaekit.domain.BaseEntity;
import qwerty.chaekit.domain.group.activity.discussion.Discussion;
import qwerty.chaekit.domain.highlight.Highlight;

@Entity
@Getter
@Table(name = "discussion_highlight")
@BatchSize(size = 20)
@NoArgsConstructor(access = lombok.AccessLevel.PROTECTED)
public class DiscussionHighlight extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "discussion_id")
    private Discussion discussion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "highlight_id")
    private Highlight highlight;

    public DiscussionHighlight(Discussion discussion, Highlight highlight) {
        this.discussion = discussion;
        this.highlight = highlight;
    }
}
