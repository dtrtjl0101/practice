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
import qwerty.chaekit.domain.member.user.UserProfile;
import qwerty.chaekit.domain.member.user.UserProfileRepository;
import qwerty.chaekit.dto.page.PageResponse;
import qwerty.chaekit.global.enums.ErrorCode;
import qwerty.chaekit.global.exception.BadRequestException;
import qwerty.chaekit.global.exception.NotFoundException;
import qwerty.chaekit.service.member.admin.AdminService;
import qwerty.chaekit.service.notification.NotificationService;
import qwerty.chaekit.service.util.EmailNotificationService;
import qwerty.chaekit.service.util.FileService;
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

}
