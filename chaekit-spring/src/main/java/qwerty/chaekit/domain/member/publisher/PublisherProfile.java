package qwerty.chaekit.domain.member.publisher;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import qwerty.chaekit.domain.BaseEntity;
import qwerty.chaekit.domain.member.Member;

@Entity
@Getter
@Table(name = "publisher_profile")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PublisherProfile extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @Column(nullable = false)
    private String publisherName;

    @Column(nullable = false)
    private boolean accepted = false;

    @Builder
    public PublisherProfile(Member member, String publisherName) {
        this.member = member;
        this.publisherName = publisherName;
    }

    public void acceptPublisher() {
        accepted = true;
    }
}
