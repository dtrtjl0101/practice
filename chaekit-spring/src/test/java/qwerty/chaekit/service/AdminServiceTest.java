package qwerty.chaekit.service;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import qwerty.chaekit.domain.member.Member;
import qwerty.chaekit.domain.member.enums.Role;
import qwerty.chaekit.domain.member.publisher.PublisherProfile;
import qwerty.chaekit.domain.member.publisher.PublisherProfileRepository;
import qwerty.chaekit.domain.member.publisher.enums.PublisherApprovalStatus;
import qwerty.chaekit.domain.member.user.UserProfile;
import qwerty.chaekit.domain.member.user.UserProfileRepository;
import qwerty.chaekit.dto.member.PublisherInfoResponse;
import qwerty.chaekit.dto.page.PageResponse;
import qwerty.chaekit.global.enums.ErrorCode;
import qwerty.chaekit.global.exception.BadRequestException;
import qwerty.chaekit.global.exception.NotFoundException;
import qwerty.chaekit.service.member.admin.AdminService;
import qwerty.chaekit.service.notification.NotificationService;
import qwerty.chaekit.service.util.EmailNotificationService;
import qwerty.chaekit.service.util.FileService;
import qwerty.chaekit.dto.member.admin.RejectPublisherRequest;
import qwerty.chaekit.dto.member.UserInfoResponse;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class AdminServiceTest {
    @InjectMocks
    private AdminService adminService;

    @Mock
    private PublisherProfileRepository publisherRepository;
    @Mock
    private UserProfileRepository userRepository;
    @Mock
    private NotificationService notificationService;
    @Mock
    private FileService fileService;
    @Mock
    private EmailNotificationService emailNotificationService;

    @Mock
    private Member member;
    @Mock
    private Member anotherMember;

    @Test
    @DisplayName("출판사 승인 - 성공")
    void testAcceptPublisher1() {
        // given
        Long publisherId = 1L;
        Long adminUserId = 1L;
        PublisherProfile publisher = PublisherProfile.builder()
                .member(member)
                .publisherName("Test Publisher")
                .build();
        UserProfile admin = UserProfile.builder()
                .id(adminUserId)
                .nickname("admin")
                .build();
        given(publisherRepository.findByIdWithMember(publisherId))
                .willReturn(Optional.of(publisher));
        given(userRepository.findById(any()))
                .willReturn(Optional.of(admin));
        // when
       adminService.acceptPublisher(publisherId);
        // then
        verify(publisherRepository).findByIdWithMember(publisherId);
        verify(emailNotificationService).sendPublisherApprovalEmail(publisher.getMember().getEmail());
        assertEquals(PublisherApprovalStatus.APPROVED, publisher.getApprovalStatus());
    }

    @Test
    @DisplayName("출판사 승인 - 이미 승인된 경우")
    void testAcceptPublisher2() {
        // given
        Long publisherId = 2L;
        PublisherProfile publisher = PublisherProfile.builder()
                .member(member)
                .publisherName("Test Publisher")
                .build();
        UserProfile admin = UserProfile.builder()
                .id(1L)
                .nickname("admin")
                .build();
        publisher.approvePublisher();
        given(publisherRepository.findByIdWithMember(publisherId))
                .willReturn(Optional.of(publisher));
        given(userRepository.findById(any()))
                .willReturn(Optional.of(admin));
        // when & then
        assertThrows(
                BadRequestException.class,
                () -> adminService.acceptPublisher(publisherId)
        );
    }

    @Test
    @DisplayName("출판사 승인 - 해당 출판사 없음")
    void testAcceptPublisher3() {
        // given
        Long publisherId = 3L;
        given(publisherRepository.findByIdWithMember(publisherId))
                .willReturn(Optional.empty());
        // when
        NotFoundException e = assertThrows(NotFoundException.class, () ->
                adminService.acceptPublisher(publisherId)
        );
        // then
        assertEquals(ErrorCode.PUBLISHER_NOT_FOUND.getCode(), e.getErrorCode());
        assertEquals(ErrorCode.PUBLISHER_NOT_FOUND.getMessage(), e.getMessage());
    }

    @Test
    @DisplayName("미승인 출판사 목록 조회 - 성공")
    void testGetPendingPublishers() {
        // given
        Pageable pageable = PageRequest.of(0, 10);  // 페이지 요청
        PublisherProfile publisher = PublisherProfile.builder()
                .member(member)
                .publisherName("Test Publisher1")
                .profileImageKey("profileImageKey1")
                .build();
        PublisherProfile anotherPublisher = PublisherProfile.builder()
                .member(anotherMember)
                .publisherName("Test Publisher2")
                .profileImageKey("profileImageKey2")
                .build();

        // PublisherProfile 설정
        List<PublisherProfile> publisherList = List.of(publisher, anotherPublisher);
        Page<PublisherProfile> pageResult = new PageImpl<>(publisherList);

        // Repository Mocking
        given(publisherRepository.findByApprovalStatus(eq(PublisherApprovalStatus.PENDING), any()))
                .willReturn(pageResult);

        // S3Service Mocking
        given(fileService.convertToPublicImageURL(anyString()))
                .willReturn("https://dummy-url.com/image");

        // when
        PageResponse<PublisherInfoResponse> result = adminService.getPendingPublishers(pageable);

        // then
        assertNotNull(result);
        assertFalse(result.content().isEmpty());
        assertEquals(2, result.content().size());  // 반환된 페이지의 크기 검증
        assertEquals("Test Publisher1", result.content().get(0).publisherName());
        assertEquals("Test Publisher2", result.content().get(1).publisherName());
        assertEquals("https://dummy-url.com/image", result.content().get(0).profileImageURL());
        assertEquals("https://dummy-url.com/image", result.content().get(1).profileImageURL());
    }

    @Test
    @DisplayName("출판사 전체 목록 조회 - 성공")
    void testGetPublishers() {
        // given
        Pageable pageable = PageRequest.of(0, 5);
        PublisherProfile publisher = PublisherProfile.builder()
                .member(member)
                .publisherName("Pub1")
                .profileImageKey("imgKey1")
                .build();
        PublisherProfile publisher2 = PublisherProfile.builder()
                .member(anotherMember)
                .publisherName("Pub2")
                .profileImageKey("imgKey2")
                .build();
        List<PublisherProfile> publisherList = List.of(publisher, publisher2);
        Page<PublisherProfile> pageResult = new PageImpl<>(publisherList);

        given(publisherRepository.findAll(any(Pageable.class))).willReturn(pageResult);
        given(fileService.convertToPublicImageURL(anyString())).willReturn("https://dummy-url.com/image");

        // when
        PageResponse<PublisherInfoResponse> result = adminService.getPublishers(pageable);

        // then
        assertNotNull(result);
        assertEquals(2, result.content().size());
        assertEquals("Pub1", result.content().get(0).publisherName());
        assertEquals("Pub2", result.content().get(1).publisherName());
        assertEquals("https://dummy-url.com/image", result.content().get(0).profileImageURL());
    }

    @Test
    @DisplayName("유저 전체 목록 조회 - 성공")
    void testGetUsers() {
        // given
        Pageable pageable = PageRequest.of(0, 5);
        UserProfile user1 = UserProfile.builder()
                .id(1L)
                .member(member)
                .nickname("user1").profileImageKey("img1").build();
        UserProfile user2 = UserProfile.builder()
                .id(2L)
                .member(member).nickname("user2").profileImageKey("img2").build();
        List<UserProfile> userList = List.of(user1, user2);
        Page<UserProfile> pageResult = new PageImpl<>(userList);

        given(userRepository.findAll(any(Pageable.class))).willReturn(pageResult);
        given(fileService.convertToPublicImageURL(anyString())).willReturn("https://dummy-url.com/userimg");
        given(member.getRole()).willReturn(Role.ROLE_USER);

        // when
        PageResponse<UserInfoResponse> result = adminService.getUsers(pageable);

        // then
        assertNotNull(result);
        assertEquals(2, result.content().size());
        assertEquals("user1", result.content().get(0).nickname());
        assertEquals("user2", result.content().get(1).nickname());
        assertEquals("https://dummy-url.com/userimg", result.content().get(0).profileImageURL());
        assertEquals("https://dummy-url.com/userimg", result.content().get(1).profileImageURL());
    }

    @Test
    @DisplayName("출판사 거절 - 성공")
    void testRejectPublisher_success() {
        // given
        Long publisherId = 10L;
        String reason = "정보 불충분";
        PublisherProfile publisher = PublisherProfile.builder()
                .member(member)
                .publisherName("거절출판사")
                .build();
        UserProfile admin = UserProfile.builder().id(100L).nickname("관리자").build();

        given(publisherRepository.findByIdWithMember(publisherId)).willReturn(Optional.of(publisher));
        given(userRepository.findById(any())).willReturn(Optional.of(admin));

        RejectPublisherRequest request = new RejectPublisherRequest(reason);

        // when
        adminService.rejectPublisher(publisherId, request);

        // then
        assertEquals(PublisherApprovalStatus.REJECTED, publisher.getApprovalStatus());
        verify(emailNotificationService).sendPublisherRejectionEmail(publisher.getMember().getEmail(), reason);
    }

    @Test
    @DisplayName("출판사 거절 - 이미 승인된 경우 예외")
    void testRejectPublisher_alreadyApproved() {
        // given
        Long publisherId = 11L;
        PublisherProfile publisher = PublisherProfile.builder()
                .member(member)
                .publisherName("이미승인")
                .build();
        publisher.approvePublisher();
        given(publisherRepository.findByIdWithMember(publisherId)).willReturn(Optional.of(publisher));

        RejectPublisherRequest request = new RejectPublisherRequest("사유");

        // when & then
        assertThrows(BadRequestException.class, () -> adminService.rejectPublisher(publisherId, request));
    }

    @Test
    @DisplayName("출판사 거절 - 출판사 없음 예외")
    void testRejectPublisher_notFound() {
        // given
        Long publisherId = 12L;
        given(publisherRepository.findByIdWithMember(publisherId)).willReturn(Optional.empty());

        RejectPublisherRequest request = new RejectPublisherRequest("사유");

        // when & then
        NotFoundException e = assertThrows(NotFoundException.class, () -> adminService.rejectPublisher(publisherId, request));
        assertEquals(ErrorCode.PUBLISHER_NOT_FOUND.getCode(), e.getErrorCode());
    }
}
