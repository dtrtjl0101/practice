package qwerty.chaekit.domain.group.review;

import jakarta.persistence.*;
import lombok.*;
import qwerty.chaekit.domain.BaseEntity;
import qwerty.chaekit.domain.group.ReadingGroup;
import qwerty.chaekit.domain.group.activity.Activity;
import qwerty.chaekit.domain.member.user.UserProfile;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Entity
@Getter
@Table(name= "group_review")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class GroupReview extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", nullable = false)
    private ReadingGroup group;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "activity_id", nullable = false)
    private Activity activity;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private UserProfile author;
    
    @Setter
    @Column(name = "content", nullable = false, length = 1000)
    private String content;
    
    @OneToMany(mappedBy = "review", cascade = CascadeType.ALL, orphanRemoval = true)
    private final List<GroupReviewTagRelation> tags = new ArrayList<>();
    
    @Builder
    public GroupReview(ReadingGroup group, Activity activity, UserProfile author, String content) {
        this.group = group;
        this.activity = activity;
        this.content = content;
        this.author = author;
    }
    
    public void setTags(List<GroupReviewTag> tags) {
        if (tags == null) return;

        Set<GroupReviewTag> existing = this.tags.stream()
                .map(GroupReviewTagRelation::getTag)
                .collect(Collectors.toSet());

        Set<GroupReviewTag> incoming = new HashSet<>(tags);

        if (existing.equals(incoming)) {
            return; // 동일하면 아무것도 하지 않음
        }

        this.tags.clear(); // 그 외에는 기존 삭제 + 새로 등록
        this.tags.addAll(tags.stream()
                .map(tag -> GroupReviewTagRelation.builder()
                        .review(this)
                        .tag(tag)
                        .build())
                .toList());
    }

}
