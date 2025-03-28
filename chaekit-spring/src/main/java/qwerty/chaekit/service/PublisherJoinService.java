package qwerty.chaekit.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import qwerty.chaekit.domain.Member.Member;
import qwerty.chaekit.domain.Member.enums.Role;
import qwerty.chaekit.domain.Member.publisher.PublisherProfile;
import qwerty.chaekit.domain.Member.publisher.PublisherProfileRepository;
import qwerty.chaekit.dto.PublisherJoinRequest;
import qwerty.chaekit.dto.PublisherMyInfoResponse;
import qwerty.chaekit.global.exception.BadRequestException;

@Service
@RequiredArgsConstructor
public class PublisherJoinService {
    private final MemberJoinHelper memberJoinHelper;
    private final PublisherProfileRepository profileRepository;

    @Transactional
    public PublisherMyInfoResponse join(PublisherJoinRequest request) {
        String username = request.username();
        String password = request.password();

        validatePublisherName(request.publisherName());
        Member member = memberJoinHelper.saveMember(username, password, Role.ROLE_PUBLISHER);
        saveProfile(request, member);

        return toResponse(request, member);
    }

    private void validatePublisherName(String name) {
        if (profileRepository.existsByPublisherName(name)) {
            throw new BadRequestException("PUBLISHER_EXISTS", "이미 사용중인 이름입니다");
        }
    }

    private void saveProfile(PublisherJoinRequest request, Member member) {
        profileRepository.save(PublisherProfile.builder()
                .member(member)
                .publisherName(request.publisherName())
                .build());
    }

    private PublisherMyInfoResponse toResponse(PublisherJoinRequest request, Member member) {
        return PublisherMyInfoResponse.builder()
                .id(member.getId())
                .username(member.getUsername())
                .publisherName(request.publisherName())
                .role(member.getRole().name())
                .build();
    }
}
