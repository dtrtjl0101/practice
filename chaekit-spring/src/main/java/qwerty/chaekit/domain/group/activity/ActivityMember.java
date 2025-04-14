package qwerty.chaekit.domain.group.activity;


import jakarta.persistence.*;
import lombok.Getter;
import qwerty.chaekit.domain.BaseEntity;
import qwerty.chaekit.domain.ebook.Ebook;
import qwerty.chaekit.domain.group.ReadingGroup;
import qwerty.chaekit.domain.member.user.UserProfile;

@Entity
@Getter
public class ActivityMember extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "activity_id")
    private Activity activity;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private UserProfile user;
}
