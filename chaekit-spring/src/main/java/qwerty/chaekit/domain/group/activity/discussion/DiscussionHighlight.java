package qwerty.chaekit.domain.group.activity.discussion;


import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import qwerty.chaekit.domain.BaseEntity;
import qwerty.chaekit.domain.highlight.entity.Highlight;

@Entity
@Getter
@Table(name = "discussion_highlight")
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
