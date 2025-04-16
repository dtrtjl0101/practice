package qwerty.chaekit.domain.purchase;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import qwerty.chaekit.domain.BaseEntity;
import qwerty.chaekit.domain.ebook.Ebook;
import qwerty.chaekit.domain.member.user.UserProfile;

@Entity
@Getter
@Table(name = "purchase")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Purchase extends BaseEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name="user_id")
    private UserProfile user;

    @ManyToOne
    @JoinColumn(name="book_id")
    private Ebook book;

    @Column(nullable = false)
    private long price;

}
