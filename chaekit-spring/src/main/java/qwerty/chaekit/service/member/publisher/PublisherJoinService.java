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
import qwerty.chaekit.service.util.S3Service;

@Service
@RequiredArgsConstructor
public class PublisherJoinService {
    private final MemberJoinHelper memberJoinHelper;
    private final PublisherProfileRepository publisherRepository;
    private final JwtUtil jwtUtil;
    private final S3Service s3Service;

    @Transactional
    public PublisherJoinResponse join(PublisherJoinRequest request) {
        String email = request.email();
        String password = request.password();
        String verificationCode = request.verificationCode();

        validatePublisherName(request.publisherName());
        Member member = memberJoinHelper.saveMemberWithVerificationCode(email, password, Role.ROLE_PUBLISHER, verificationCode);
        PublisherProfile publisher = savePublisher(request, member);

        return toResponse(request, member, publisher);
    }

    private void validatePublisherName(String name) {
        if (publisherRepository.existsByPublisherName(name)) {
            throw new BadRequestException(ErrorCode.PUBLISHER_ALREADY_EXISTS);
        }
    }

    private PublisherProfile savePublisher(PublisherJoinRequest request, Member member) {
        return publisherRepository.save(PublisherProfile.builder()
                .member(member)
                .publisherName(request.publisherName())
                .build());
    }

    private PublisherJoinResponse toResponse(PublisherJoinRequest request, Member member, PublisherProfile publisher) {
        String token = jwtUtil.createJwt(member.getId(), null, publisher.getId(), member.getEmail(), Role.ROLE_PUBLISHER.name());
        String imageUrl = s3Service.convertToPublicImageUrl(publisher.getProfileImageKey());

        return PublisherJoinResponse.builder()
                .memberId(member.getId())
                .publisherId(publisher.getId())
                .accessToken("Bearer " + token)
                .email(member.getEmail())
                .publisherName(request.publisherName())
                .profileImageURL(imageUrl)
                .isAccepted(false)
                .build();
    }
}
