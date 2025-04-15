package qwerty.chaekit.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import qwerty.chaekit.domain.member.publisher.PublisherProfile;
import qwerty.chaekit.domain.member.publisher.PublisherProfileRepository;
import qwerty.chaekit.dto.member.PublisherMemberResponse;
import qwerty.chaekit.global.enums.ErrorCode;
import qwerty.chaekit.global.exception.NotFoundException;
import qwerty.chaekit.global.security.resolver.LoginMember;

@Slf4j
@Service
@RequiredArgsConstructor
public class PublisherService {
    private final PublisherProfileRepository profileRepository;

    public PublisherMemberResponse getPublisherProfile(LoginMember loginMember) {
        PublisherProfile profile = profileRepository.findByMember_Id(loginMember.memberId())
                .orElseThrow(() -> new NotFoundException(ErrorCode.PUBLISHER_NOT_FOUND));

        return PublisherMemberResponse.builder()
                .id(loginMember.memberId())
                .publisherName(profile.getPublisherName())
                .username(loginMember.username())
                .role(loginMember.role())
                .isAccepted(profile.isAccepted())
                .build();
    }
}
