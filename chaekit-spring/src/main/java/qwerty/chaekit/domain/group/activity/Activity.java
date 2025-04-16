package qwerty.chaekit.domain.group.activity;


import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import qwerty.chaekit.domain.BaseEntity;
import qwerty.chaekit.domain.ebook.Ebook;
import qwerty.chaekit.domain.group.ReadingGroup;

import java.time.LocalDate;

@Entity
@Getter
@Table(name = "activity")
@NoArgsConstructor(access = lombok.AccessLevel.PROTECTED)
public class Activity extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "group_id")
    private ReadingGroup group;

    @ManyToOne
    @JoinColumn(name = "book_id")
    private Ebook book;

    @Column(nullable = false)
    private LocalDate startTime;

    @Column(nullable = false)
    private LocalDate endTime;

    private String description;

    @Builder
    public Activity(ReadingGroup group, Ebook book, LocalDate startTime, LocalDate endTime, String description) {
        this.group = group;
        this.book = book;
        this.startTime = startTime;
        this.endTime = endTime;
        this.description = description;
    }
}
