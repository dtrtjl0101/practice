package qwerty.chaekit.domain.Member;

import jakarta.persistence.*;
import lombok.*;
import qwerty.chaekit.domain.BaseEntity;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Member extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String username;
    private String password;

    private String role;

    @Builder
    public Member(final String username,final String password,final String role) {
        this.username = username;
        this.password = password;
        this.role = role;
    }
}
