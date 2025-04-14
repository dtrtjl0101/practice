package qwerty.chaekit.domain.group.activity;


import jakarta.persistence.*;
import lombok.Getter;
import qwerty.chaekit.domain.BaseEntity;
import qwerty.chaekit.domain.ebook.Ebook;
import qwerty.chaekit.domain.group.ReadingGroup;

@Entity
@Getter
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


}
