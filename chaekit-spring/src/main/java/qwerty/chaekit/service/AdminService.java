package qwerty.chaekit.service;

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
import qwerty.chaekit.global.enums.ErrorCode;
import qwerty.chaekit.dto.page.PageResponse;
import qwerty.chaekit.global.exception.NotFoundException;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AdminService {
    private final PublisherProfileRepository publisherProfileRepository;
    @Getter
    @Setter
    private Long adminPublisherId;

    @Transactional(readOnly = true)
    public PageResponse<PublisherInfoResponse> getNotAcceptedPublishers(Pageable pageable) {
        Page<PublisherProfile> page = publisherProfileRepository.findAllByAcceptedFalseOrderByCreatedAtDesc(pageable);
        return PageResponse.of(page.map(PublisherInfoResponse::of));
    }

    @Transactional
    public boolean acceptPublisher(Long publisherId) {
        Optional<PublisherProfile> profile = publisherProfileRepository.findByMember_Id(publisherId);
        if (profile.isPresent()) {
            if(profile.get().isAccepted()) {
                return false;
            }
            profile.get().acceptPublisher();
            return true;
        } else {
            throw new NotFoundException(ErrorCode.PUBLISHER_NOT_FOUND);
        }
    }
}
