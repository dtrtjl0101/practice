package qwerty.chaekit.domain.group.activity.discussion;


import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import qwerty.chaekit.domain.BaseEntity;
import qwerty.chaekit.domain.group.activity.Activity;
import qwerty.chaekit.domain.member.user.UserProfile;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Table(name = "discussion")
@NoArgsConstructor(access = lombok.AccessLevel.PROTECTED)
public class Discussion extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "activity_id")
    private Activity activity;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String content;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id")
    private UserProfile author;

    @Column(nullable = false)
    private boolean isDebate = false;

    @OneToMany(mappedBy = "discussion")
    private List<DiscussionComment> comments = new ArrayList<>();
}
