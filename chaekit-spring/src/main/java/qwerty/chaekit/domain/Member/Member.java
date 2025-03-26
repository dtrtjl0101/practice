package qwerty.chaekit.domain.Member;

import jakarta.persistence.*;
import lombok.*;
import qwerty.chaekit.domain.BaseEntity;
import qwerty.chaekit.domain.Member.enums.Role;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Member extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String username;
    private String password;

    @Enumerated(EnumType.STRING)
    private Role role;

    @Builder
    public Member(final String username,final String password,final Role role) {
        this.username = username;
        this.password = password;
        this.role = role;
    }
}
