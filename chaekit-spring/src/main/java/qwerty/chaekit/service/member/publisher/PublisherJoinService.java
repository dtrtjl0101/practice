package qwerty.chaekit.service.member.publisher;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import qwerty.chaekit.domain.member.Member;
import qwerty.chaekit.domain.member.enums.Role;
import qwerty.chaekit.domain.member.publisher.PublisherProfile;
import qwerty.chaekit.domain.member.publisher.PublisherProfileRepository;
import qwerty.chaekit.dto.member.PublisherJoinRequest;
import qwerty.chaekit.dto.member.PublisherJoinResponse;
import qwerty.chaekit.global.enums.ErrorCode;
import qwerty.chaekit.global.exception.BadRequestException;
import qwerty.chaekit.global.jwt.JwtUtil;
import qwerty.chaekit.service.member.MemberJoinHelper;

@Service
@RequiredArgsConstructor
public class PublisherJoinService {
    private final MemberJoinHelper memberJoinHelper;
    private final PublisherProfileRepository profileRepository;
    private final JwtUtil jwtUtil;

    @Transactional
    public PublisherJoinResponse join(PublisherJoinRequest request) {
        String username = request.username();
        String password = request.password();

        validatePublisherName(request.publisherName());
        Member member = memberJoinHelper.saveMember(username, password, Role.ROLE_PUBLISHER);
        saveProfile(request, member);

        return toResponse(request, member);
    }

    private void validatePublisherName(String name) {
        if (profileRepository.existsByPublisherName(name)) {
            throw new BadRequestException(ErrorCode.PUBLISHER_ALREADY_EXISTS);
        }
    }

    private void saveProfile(PublisherJoinRequest request, Member member) {
        profileRepository.save(PublisherProfile.builder()
                .member(member)
                .publisherName(request.publisherName())
                .build());
    }

    private PublisherJoinResponse toResponse(PublisherJoinRequest request, Member member) {
        String token = jwtUtil.createJwt(member.getId(), member.getUsername(), Role.ROLE_PUBLISHER.name());

        return PublisherJoinResponse.builder()
                .id(member.getId())
                .accessToken("Bearer " + token)
                .username(member.getUsername())
                .publisherName(request.publisherName())
                .role(member.getRole().name())
                .isAccepted(false)
                .build();
    }
}
