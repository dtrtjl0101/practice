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
import qwerty.chaekit.domain.member.publisher.PublisherProfile;
import qwerty.chaekit.domain.member.publisher.PublisherProfileRepository;
import qwerty.chaekit.dto.member.PublisherInfoResponse;
import qwerty.chaekit.dto.page.PageResponse;
import qwerty.chaekit.global.enums.ErrorCode;
import qwerty.chaekit.global.exception.NotFoundException;
import qwerty.chaekit.service.member.admin.AdminService;
import qwerty.chaekit.service.member.notification.EmailService;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.BDDMockito.given;

@ExtendWith(MockitoExtension.class)
class AdminServiceTest {
    @InjectMocks
    private AdminService adminService;

    @Mock
    private PublisherProfileRepository publisherRepository;
    @Mock
    private EmailService emailService;

    @Mock
    private Member member;
    @Mock
    private Member anotherMember;

    @Test
    @DisplayName("출판사 승인 - 성공")
    void testAcceptPublisher1() {
        // given
        Long publisherId = 1L;
        PublisherProfile publisher = PublisherProfile.builder()
                .member(member)
                .publisherName("Test Publisher")
                .build();
        given(publisherRepository.findByIdWithMember(publisherId))
                .willReturn(Optional.of(publisher));
        // when
        boolean result = adminService.acceptPublisher(publisherId);
        // then
        assertTrue(result);
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
        publisher.acceptPublisher();
        given(publisherRepository.findByIdWithMember(publisherId))
                .willReturn(Optional.of(publisher));
        // when
        boolean result = adminService.acceptPublisher(publisherId);
        // then
        assertFalse(result);
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
    void testGetNotAcceptedPublishers() {
        // given
        Pageable pageable = PageRequest.of(0, 10);  // 페이지 요청
        PublisherProfile publisher = PublisherProfile.builder()
                .member(member)
                .publisherName("Test Publisher1")
                .build();
        PublisherProfile anotherPublisher = PublisherProfile.builder()
                .member(anotherMember)
                .publisherName("Test Publisher2")
                .build();

        // PublisherProfile 설정
        List<PublisherProfile> publisherList = List.of(publisher, anotherPublisher);
        Page<PublisherProfile> pageResult = new PageImpl<>(publisherList);

        // Repository Mocking
        given(publisherRepository.findAllByAcceptedFalseOrderByCreatedAtDesc(pageable))
                .willReturn(pageResult);

        // when
        PageResponse<PublisherInfoResponse> result = adminService.getNotAcceptedPublishers(pageable);

        // then
        assertNotNull(result);
        assertFalse(result.content().isEmpty());
        assertEquals(2, result.content().size());  // 반환된 페이지의 크기 검증
        assertEquals("Test Publisher1", result.content().get(0).publisherName());
        assertEquals("Test Publisher2", result.content().get(1).publisherName());
    }
}
