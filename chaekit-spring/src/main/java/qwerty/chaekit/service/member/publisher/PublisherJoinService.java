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
    private final PublisherProfileRepository publisherRepository;
    private final JwtUtil jwtUtil;

    @Transactional
    public PublisherJoinResponse join(PublisherJoinRequest request) {
        String email = request.email();
        String password = request.password();
        String verificationCode = request.verificationCode();

        String imageFileKey = memberJoinHelper.uploadProfileImage(request.profileImage());

        validatePublisherName(request.publisherName());
        Member member = memberJoinHelper.saveMemberWithVerificationCode(email, password, Role.ROLE_PUBLISHER, verificationCode);
        PublisherProfile publisher = savePublisher(request, member, imageFileKey);

        return toResponse(member, publisher);
    }

    private void validatePublisherName(String name) {
        if (publisherRepository.existsByPublisherName(name)) {
            throw new BadRequestException(ErrorCode.PUBLISHER_ALREADY_EXISTS);
        }
    }

    private PublisherProfile savePublisher(PublisherJoinRequest request, Member member, String imageFileKey) {
        return publisherRepository.save(PublisherProfile.builder()
                .member(member)
                .publisherName(request.publisherName())
                .profileImageKey(imageFileKey)
                .build());
    }

    private PublisherJoinResponse toResponse(Member member, PublisherProfile publisher) {
        String token = "Bearer " + jwtUtil.createAccessToken(
                member.getId(),
                null,
                publisher.getId(),
                member.getEmail(),
                Role.ROLE_PUBLISHER.name()
        );
        String profileImageUrl = memberJoinHelper.convertToPublicImageURL(publisher.getProfileImageKey());

        return PublisherJoinResponse.builder()
                .memberId(member.getId())
                .publisherId(publisher.getId())
                .accessToken(token)
                .email(member.getEmail())
                .publisherName(publisher.getPublisherName())
                .profileImageURL(profileImageUrl)
                .status(publisher.getApprovalStatus().name())
                .build();
    }
}
