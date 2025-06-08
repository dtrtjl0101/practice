package qwerty.chaekit.domain.ebook.history;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import qwerty.chaekit.domain.BaseEntity;
import qwerty.chaekit.domain.group.activity.Activity;
import qwerty.chaekit.domain.member.user.UserProfile;

@Entity
@Getter
@Table(name = "reading_progress_history")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ReadingProgressHistory extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "activity_id")
    private Activity activity;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private UserProfile user;

    @Column(nullable = false)
    private long percentage;

    @Builder
    public ReadingProgressHistory(Activity activity, UserProfile user, long percentage) {
        this.activity = activity;
        this.user = user;
        this.percentage = percentage;
    }
}