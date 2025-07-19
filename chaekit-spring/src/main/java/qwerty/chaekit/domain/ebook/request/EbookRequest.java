package qwerty.chaekit.domain.ebook.request;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import qwerty.chaekit.domain.BaseEntity;
import qwerty.chaekit.domain.ebook.Ebook;
import qwerty.chaekit.domain.member.publisher.PublisherProfile;

@Entity
@Getter
@Table(name = "ebook_request")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class EbookRequest extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String author;

    @Column(length = 10000)
    private String description;

    private long size;

    private int price;

    @Column(nullable = false)
    private String fileKey;

    private String coverImageKey;

//    @ManyToOne(fetch = FetchType.LAZY)
//    @JoinColumn(name = "publisher_id")
//    private PublisherProfile publisher;

    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ebook_id")
    private Ebook approvedEbook;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EbookRequestStatus status;
    
    private String rejectReason;

    @Builder
    public EbookRequest(
            Long id, String title, String author, String description, 
            long size, int price, 
            String fileKey, String coverImageKey, String rejectReason) {
        this.id = id;
        this.title = title;
        this.author = author;
        this.description = description;
        this.size = size;
        this.price = price;
        this.fileKey = fileKey;
        this.coverImageKey = coverImageKey;
        this.status = EbookRequestStatus.PENDING;
        this.rejectReason = rejectReason;
    }
    
    public Ebook toEbook() {
        return Ebook.builder()
                .title(this.title)
                .author(this.author)
                .description(this.description)
                .size(this.size)
                .price(this.price)
                .fileKey(this.fileKey)
                .coverImageKey(this.coverImageKey)
                .build();
    }
    
    public boolean isNotPending() {
        return this.status != EbookRequestStatus.PENDING;
    }
    
    public void approve(Ebook ebook) {
        this.status = EbookRequestStatus.APPROVED;
        this.approvedEbook = ebook;
    }
    
    public void reject(String reason) {
        this.status = EbookRequestStatus.REJECTED;
        this.rejectReason = reason;
    }
}
