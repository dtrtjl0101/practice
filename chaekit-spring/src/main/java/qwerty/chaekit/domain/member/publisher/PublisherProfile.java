package qwerty.chaekit.domain.member.publisher;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import qwerty.chaekit.domain.BaseEntity;
import qwerty.chaekit.domain.member.Member;
import qwerty.chaekit.domain.member.publisher.enums.PublisherApprovalStatus;

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

    private String profileImageKey;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private PublisherApprovalStatus approvalStatus = PublisherApprovalStatus.PENDING;

    @Builder
    public PublisherProfile(Long id, Member member, String publisherName, String profileImageKey) {
        this.id = id;
        this.member = member;
        this.publisherName = publisherName;
        this.profileImageKey = profileImageKey;
    }

    public void approvePublisher() {
        approvalStatus = PublisherApprovalStatus.APPROVED;
    }
    public void rejectPublisher() {
        approvalStatus = PublisherApprovalStatus.REJECTED;
    }
    public boolean isApproved() {
        return approvalStatus == PublisherApprovalStatus.APPROVED;
    }

    public boolean isNotAdmin() {
        return !member.isAdmin();
    }
}
