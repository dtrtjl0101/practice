package qwerty.chaekit.service.member.publisher;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import qwerty.chaekit.domain.member.Member;
import qwerty.chaekit.domain.member.enums.Role;
import qwerty.chaekit.domain.member.publisher.PublisherProfile;
import qwerty.chaekit.domain.member.publisher.PublisherProfileRepository;
import qwerty.chaekit.dto.member.LoginResponse;
import qwerty.chaekit.dto.member.PublisherJoinRequest;
import qwerty.chaekit.global.enums.ErrorCode;
import qwerty.chaekit.global.exception.BadRequestException;
import qwerty.chaekit.global.exception.NotFoundException;
import qwerty.chaekit.global.jwt.JwtUtil;
import qwerty.chaekit.service.member.MemberJoinHelper;
import qwerty.chaekit.service.member.token.RefreshTokenService;
import qwerty.chaekit.service.notification.NotificationService;
import qwerty.chaekit.domain.member.user.UserProfile;
import qwerty.chaekit.domain.member.user.UserProfileRepository;
import qwerty.chaekit.service.member.admin.AdminService;

@Service
@RequiredArgsConstructor
public class PublisherJoinService {
    private final MemberJoinHelper memberJoinHelper;
    private final PublisherProfileRepository publisherRepository;
    private final JwtUtil jwtUtil;
    private final RefreshTokenService refreshTokenService;
    private final NotificationService notificationService;
    private final UserProfileRepository userProfileRepository;
    private final AdminService adminService;
    private final PublisherService publisherService;

    @Transactional
    public LoginResponse join(PublisherJoinRequest request) {
        String email = request.email();
        String password = request.password();
        String verificationCode = request.verificationCode();

        String imageFileKey = memberJoinHelper.uploadProfileImage(request.profileImage());

        validatePublisherName(request.publisherName());
        Member member = memberJoinHelper.saveMemberWithVerificationCode(email, password, Role.ROLE_PUBLISHER, verificationCode);
        PublisherProfile publisher = savePublisher(request, member, imageFileKey);

        UserProfile adminProfile = userProfileRepository.findById(adminService.getAdminUserId())
                .orElseThrow(() -> new NotFoundException(ErrorCode.USER_NOT_FOUND));
        PublisherProfile publisherProfile = publisherRepository.findByMember_Id(publisher.getId())
                .orElseThrow(() -> new NotFoundException(ErrorCode.USER_NOT_FOUND));
        notificationService.createPublisherJoinRequestNotification(adminProfile, publisherProfile);

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

    private LoginResponse toResponse(Member member, PublisherProfile publisher) {
        String accessToken = jwtUtil.createAccessToken(
                member.getId(),
                null,
                publisher.getId(),
                member.getEmail(),
                Role.ROLE_PUBLISHER.name()
        );
        String refreshToken = refreshTokenService.issueRefreshToken(member.getId());
        String profileImageUrl = memberJoinHelper.convertToPublicImageURL(publisher.getProfileImageKey());

        return LoginResponse.builder()
                .memberId(member.getId())
                .publisherId(publisher.getId())
                .refreshToken(refreshToken)
                .accessToken(accessToken)
                .email(member.getEmail())
                .publisherName(publisher.getPublisherName())
                .profileImageURL(profileImageUrl)
                .role(Role.ROLE_USER.name())
                .build();
    }
}
