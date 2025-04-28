package qwerty.chaekit.domain.highlight.entity.comment;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import qwerty.chaekit.domain.BaseEntity;
import qwerty.chaekit.domain.highlight.entity.Highlight;
import qwerty.chaekit.domain.member.user.UserProfile;

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

}