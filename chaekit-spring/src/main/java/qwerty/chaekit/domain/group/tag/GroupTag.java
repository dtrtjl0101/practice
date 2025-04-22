package qwerty.chaekit.domain.group.tag;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import qwerty.chaekit.domain.BaseEntity;
import qwerty.chaekit.domain.group.ReadingGroup;

@Entity
@Getter
@Table(name= "group_tag")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class GroupTag extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private ReadingGroup readingGroup;

    @Column(name ="tag_name", nullable = false)
    private String tagName;

    public GroupTag(ReadingGroup readingGroup, String tagName) {
        this.readingGroup = readingGroup;
        this.tagName = tagName;
    }
}
