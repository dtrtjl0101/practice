package qwerty.chaekit.service.highlight;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.transaction.annotation.Transactional;
import qwerty.chaekit.domain.ebook.Ebook;
import qwerty.chaekit.domain.ebook.EbookRepository;
import qwerty.chaekit.domain.highlight.entity.Highlight;
import qwerty.chaekit.domain.highlight.repository.HighlightRepository;
import qwerty.chaekit.domain.member.Member;
import qwerty.chaekit.domain.member.MemberRepository;
import qwerty.chaekit.domain.member.enums.Role;
import qwerty.chaekit.domain.member.publisher.PublisherProfile;
import qwerty.chaekit.domain.member.publisher.PublisherProfileRepository;
import qwerty.chaekit.domain.member.user.UserProfile;
import qwerty.chaekit.domain.member.user.UserProfileRepository;
import qwerty.chaekit.dto.highlight.HighlightFetchResponse;
import qwerty.chaekit.dto.highlight.HighlightPostRequest;
import qwerty.chaekit.dto.highlight.HighlightPostResponse;
import qwerty.chaekit.dto.highlight.HighlightPutRequest;
import qwerty.chaekit.dto.page.PageResponse;
import qwerty.chaekit.global.security.resolver.LoginMember;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

@SpringBootTest
@Transactional
class HighlightServiceTest {
    @Autowired
    private HighlightService highlightService;

    @Autowired
    private MemberRepository memberRepository;

    @Autowired
    private HighlightRepository highlightRepository;

    @Autowired
    private EbookRepository ebookRepository;

    @Autowired
    private UserProfileRepository userProfileRepository;

    @Autowired
    private PublisherProfileRepository publisherProfileRepository;

    private UserProfile dummyUserProfile;
    private Ebook dummyEbook;
    private LoginMember dummyLoginMember;

    @BeforeEach
    void setUp() {
        Member userAccount = memberRepository.save(
                Member.builder()
                    .username("user_account")
                    .password("user_password")
                    .role(Role.ROLE_USER)
                    .build());
        dummyUserProfile = userProfileRepository.save(
                UserProfile.builder()
                        .member(userAccount)
                        .nickname("test_nickname")
                        .build()
        );

        Member publisherAccount = memberRepository.save(
                Member.builder()
                    .username("publisher_account")
                    .password("publisher_password")
                    .role(Role.ROLE_PUBLISHER)
                    .build());
        PublisherProfile dummyPublisherProfile = publisherProfileRepository.save(
                PublisherProfile.builder()
                        .member(publisherAccount)
                        .publisherName("test_publisher_name")
                        .build());

        dummyEbook = ebookRepository.save(Ebook.builder()
                .title("test-title")
                .description("test-description")
                .size(2 * 1024 * 1024)
                .fileKey("test-file-key")
                .author("test-author")
                .publisher(dummyPublisherProfile)
                .build());
        dummyLoginMember = new LoginMember(
                dummyUserProfile.getMember().getId(),
                dummyUserProfile.getMember().getUsername(),
                dummyUserProfile.getMember().getRole().name()
        );
    }

    @Test
    @DisplayName("Highlight 생성 테스트")
    void createHighlightTest() {
        // Given
        LoginMember loginMember = new LoginMember(
                dummyUserProfile.getMember().getId(),
                dummyUserProfile.getMember().getUsername(),
                dummyUserProfile.getMember().getRole().name()
        );
        HighlightPostRequest request = HighlightPostRequest.builder()
                .bookId(dummyEbook.getId())
                .spine("spine1")
                .cfi("cfi1")
                .memo("Test Memo")
                .build();

        // When
        HighlightPostResponse response = highlightService.createHighlight(loginMember, request);

        // Then
        assertThat(response).isNotNull();
        assertThat(response.bookId()).isEqualTo(dummyEbook.getId());
        assertThat(response.memo()).isEqualTo("Test Memo");
    }

    @Test
    @DisplayName("Highlight 조회 테스트")
    void fetchHighlightsTest() {
        // Given
        Highlight highlight = highlightRepository.save(Highlight.builder()
                .author(dummyUserProfile)
                .book(dummyEbook)
                .spine("spine1")
                .cfi("cfi1")
                .memo("Test Memo")
                .build());
        Pageable pageable = PageRequest.of(0, 10);

        // When
        PageResponse<HighlightFetchResponse> response = highlightService.fetchHighlights(
                dummyLoginMember,
                pageable,
                null,
                dummyEbook.getId(),
                null,
                true
        );

        // Then
        assertThat(response).isNotNull();
        assertThat(response.content()).hasSize(1);
        HighlightFetchResponse fetchResponse = response.content().get(0);
        assertThat(fetchResponse.id()).isEqualTo(highlight.getId());
        assertThat(fetchResponse.memo()).isEqualTo("Test Memo");
    }

    @Test
    @DisplayName("Highlight 업데이트 테스트")
    void updateHighlightTest() {
        // Given
        Highlight highlight = highlightRepository.save(Highlight.builder()
                .author(dummyUserProfile)
                .book(dummyEbook)
                .spine("spine1")
                .cfi("cfi1")
                .memo("Old Memo")
                .build());
        HighlightPutRequest request = HighlightPutRequest.builder()
                .memo("Updated Memo")
                .build();

        // When
        HighlightPostResponse response = highlightService.updateHighlight(dummyLoginMember, highlight.getId(), request);

        // Then
        assertThat(response).isNotNull();
        assertThat(response.memo()).isEqualTo("Updated Memo");

        Optional<Highlight> updatedHighlight = highlightRepository.findById(highlight.getId());
        assertThat(updatedHighlight).isPresent();
        assertThat(updatedHighlight.get().getMemo()).isEqualTo("Updated Memo");
    }

    @Test
    @DisplayName("권한 없는 Highlight 업데이트 시 예외 발생 테스트")
    void updateHighlightForbiddenTest() {
        // Given
        // Highlight를 생성합니다.
        Highlight highlight = highlightRepository.save(Highlight.builder()
                .author(dummyUserProfile)
                .book(dummyEbook)
                .spine("spine1")
                .cfi("cfi1")
                .memo("Old Memo")
                .build());

        // 다른 사용자의 프로필을 생성합니다.
        Member anotherMember = Member.builder()
                .username("another_member")
                .password("another_member_password")
                .role(Role.ROLE_USER)
                .build();
        memberRepository.save(anotherMember);

        UserProfile dummyUserProfile2 = userProfileRepository.save(
                UserProfile.builder()
                        .member(anotherMember)
                        .nickname("another_test_nickname")
                        .build()
        );

        UserProfile anotherUserProfile = userProfileRepository.save(dummyUserProfile2);
        LoginMember anotherLoginMember = LoginMember.builder()
                .memberId(anotherUserProfile.getMember().getId())
                .username(anotherUserProfile.getMember().getUsername())
                .role(anotherUserProfile.getMember().getRole().name())
                .build();
        HighlightPutRequest request = HighlightPutRequest.builder()
                .memo("Updated Memo")
                .build();

        // When & Then
        assertThrows(Exception.class, () -> highlightService.updateHighlight(anotherLoginMember, highlight.getId(), request));
    }
}