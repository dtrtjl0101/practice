package qwerty.chaekit.domain.notification;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import qwerty.chaekit.domain.BaseEntity;
import qwerty.chaekit.domain.ebook.Ebook;
import qwerty.chaekit.domain.highlight.entity.Highlight;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ReadingProgress extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ebook_id", nullable = false)
    private Ebook ebook;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "highlight_id")
    private Highlight highlight;

    @Column(nullable = false)
    private String cfi;

    @Column(nullable = false)
    private Long percentage;

    @Builder
    public ReadingProgress(Ebook ebook, Highlight highlight, String cfi, Long percentage) {
        this.ebook = ebook;
        this.highlight = highlight;
        this.cfi = cfi;
        this.percentage = percentage;
    }

    public void updateProgress(Long percentage) {
        this.percentage = percentage;
    }
}