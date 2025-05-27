package qwerty.chaekit.domain.group.review;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import qwerty.chaekit.domain.BaseEntity;

@Entity
@Getter
@Table(name= "group_review_tag")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class GroupReviewTagRelation extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_review_id", nullable = false)
    private GroupReview review;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "tag", nullable = false)
    private GroupReviewTag tag;
    
    @Builder
    public GroupReviewTagRelation(GroupReview review, GroupReviewTag tag) {
        this.review = review;
        this.tag = tag;
    }
    
}
