package qwerty.chaekit.service.member.publisher;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import qwerty.chaekit.domain.member.publisher.PublisherProfile;
import qwerty.chaekit.domain.member.publisher.PublisherProfileRepository;
import qwerty.chaekit.dto.member.PublisherMemberResponse;
import qwerty.chaekit.global.enums.ErrorCode;
import qwerty.chaekit.global.exception.NotFoundException;
import qwerty.chaekit.global.security.resolver.PublisherToken;

@Slf4j
@Service
@RequiredArgsConstructor
public class PublisherService {
    private final PublisherProfileRepository publisherRepository;

    public PublisherMemberResponse getPublisherProfile(PublisherToken token) {
        PublisherProfile publisher = publisherRepository.findById(token.publisherId())
                .orElseThrow(() -> new NotFoundException(ErrorCode.PUBLISHER_NOT_FOUND));

        return PublisherMemberResponse.builder()
                .id(token.memberId())
                .publisherId(publisher.getId())
                .publisherName(publisher.getPublisherName())
                .email(token.email())
                .isAccepted(publisher.isAccepted())
                .build();
    }
}
