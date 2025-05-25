package qwerty.chaekit.domain.group.activity;


import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.BatchSize;
import qwerty.chaekit.domain.BaseEntity;
import qwerty.chaekit.domain.ebook.Ebook;
import qwerty.chaekit.domain.group.ReadingGroup;
import qwerty.chaekit.domain.group.activity.activitymember.ActivityMember;
import qwerty.chaekit.domain.group.activity.discussion.Discussion;
import qwerty.chaekit.domain.member.user.UserProfile;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Table(name = "activity")
@NoArgsConstructor(access = lombok.AccessLevel.PROTECTED)
@BatchSize(size = 20) // mostly for fetching ebooks
public class Activity extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id")
    private ReadingGroup group;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_id")
    private Ebook book;

    @Column(nullable = false)
    private LocalDate startTime;

    @Column(nullable = false)
    private LocalDate endTime;

    @Column(length = 5000)
    private String description;
    
    @OneToMany(mappedBy = "activity", cascade = CascadeType.ALL, orphanRemoval = true)
    @BatchSize(size = 50)
    private final List<ActivityMember> participants = new ArrayList<>();

    @OneToMany(mappedBy = "activity", cascade = CascadeType.ALL, orphanRemoval = true)
    @BatchSize(size = 20)
    private final List<Discussion> discussions = new ArrayList<>();

    @Builder
    public Activity(Long id, ReadingGroup group, Ebook book, LocalDate startTime, LocalDate endTime, String description) {
        this.id = id;
        this.group = group;
        this.book = book;
        this.startTime = startTime;
        this.endTime = endTime;
        this.description = description;
    }
    
    public boolean isParticipant(UserProfile user) {
        return participants.stream()
                .anyMatch(participant -> participant.getUser().getId().equals(user.getId()));
    }
    
    public boolean isFromGroup(ReadingGroup group) {
        return this.group.getId().equals(group.getId());
    }
    
    public boolean isEnded() {
        return LocalDate.now().isAfter(endTime);
    }

    public void updateTime(LocalDate startTime, LocalDate endTime) {
        if(startTime != null) {
            this.startTime = startTime;
        }
        if(endTime != null) {
            this.endTime = endTime;
        }
    }

    public void updateDescription(String description) {
        if(description != null) {
            this.description = description;
        }
    }
    
    public void addParticipant(UserProfile user) {
        participants.add(
                ActivityMember.builder()
                        .activity(this)
                        .user(user)
                        .build()
        );
    }
    
    public void removeParticipant(UserProfile user) {
        participants.removeIf(participant -> participant.getUser().getId().equals(user.getId()));
    }
}
