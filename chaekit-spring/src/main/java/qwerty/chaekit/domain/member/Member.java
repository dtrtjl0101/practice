package qwerty.chaekit.domain.member;

import jakarta.persistence.*;
import lombok.*;
import qwerty.chaekit.domain.BaseEntity;
import qwerty.chaekit.domain.member.enums.Role;

@Entity
@Getter
@Table(name = "member")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Member extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String username;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Builder
    public Member(String username, String password, Role role) {
        this.username = username;
        this.password = password;
        this.role = role;
    }
}
