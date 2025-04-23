package qwerty.chaekit.service.member.admin;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import qwerty.chaekit.domain.member.publisher.PublisherProfile;
import qwerty.chaekit.domain.member.publisher.PublisherProfileRepository;
import qwerty.chaekit.dto.member.PublisherInfoResponse;
import qwerty.chaekit.dto.page.PageResponse;
import qwerty.chaekit.global.enums.ErrorCode;
import qwerty.chaekit.global.exception.NotFoundException;
import qwerty.chaekit.service.member.notification.EmailService;
import qwerty.chaekit.service.util.S3Service;

@Service
@RequiredArgsConstructor
public class AdminService {
    private final PublisherProfileRepository publisherRepository;
    private final EmailService emailService;
    private final S3Service s3Service;

    @Getter
    @Setter
    private Long adminPublisherId;

    @Getter
    @Setter
    private Long adminUserId;

    @Transactional(readOnly = true)
    public PageResponse<PublisherInfoResponse> getNotAcceptedPublishers(Pageable pageable) {
        Page<PublisherProfile> page = publisherRepository.findAllByAcceptedFalseOrderByCreatedAtDesc(pageable);
        return PageResponse.of(page.map(publisher -> PublisherInfoResponse.of(
                        publisher,
                        s3Service.convertToPublicImageUrl(publisher.getProfileImageKey())
                )));
    }

    @Transactional
    public boolean acceptPublisher(Long publisherId) {
        PublisherProfile publisher = publisherRepository.findByIdWithMember(publisherId)
                .orElseThrow(() -> new NotFoundException(ErrorCode.PUBLISHER_NOT_FOUND));

        // 이미 승인된 경우
        if (publisher.isAccepted()) {
            return false;
        }

        // 승인 처리
        publisher.acceptPublisher();
        emailService.sendPublisherApprovalEmail(publisher.getMember().getEmail());
        return true;
    }
}
