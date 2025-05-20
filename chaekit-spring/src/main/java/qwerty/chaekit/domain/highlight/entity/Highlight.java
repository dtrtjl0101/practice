package qwerty.chaekit.domain.highlight.entity;

import jakarta.persistence.*;
import lombok.*;
import qwerty.chaekit.domain.BaseEntity;
import qwerty.chaekit.domain.ebook.Ebook;
import qwerty.chaekit.domain.group.activity.Activity;
import qwerty.chaekit.domain.highlight.entity.comment.HighlightComment;
import qwerty.chaekit.domain.member.user.UserProfile;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Table(name = "highlight")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Highlight extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id")
    private UserProfile author;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_id")
    private Ebook book;

    @Column(nullable = false)
    private String cfi;

    @Column(nullable = false)
    private String spine;

    @Column(nullable = false)
    private String highlightcontent;
  
    @Column(length = 2000)
    private String memo;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="activity_id")
    private Activity activity;

    @Column(nullable = false)
    private boolean isPublic;
    
    @OneToMany(mappedBy = "highlight", cascade = CascadeType.ALL, orphanRemoval = true)
    private final List<HighlightComment> comments = new ArrayList<>();

    @Builder
    public Highlight(Long id, UserProfile author, Ebook book, String cfi, String spine, String highlightcontent, String memo, Activity activity, boolean isPublic) {
        this.id = id;
        this.author = author;
        this.book = book;
        this.cfi = cfi;
        this.spine = spine;
        this.highlightcontent=highlightcontent;
        this.memo = memo;
        this.activity = activity;
        this.isPublic = isPublic;
    }

    public void updateMemo(String memo) {
        this.memo = memo;
    }

    public void setAsPublicActivity(Activity activity) {
        this.activity = activity;
        this.isPublic = true;
    }

    public boolean isPublic() {
        return isPublic;
    }
    
    public boolean isAuthor(UserProfile user) {
        return author.getId().equals(user.getId());
    }
}
