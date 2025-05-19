package qwerty.chaekit.integration;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import qwerty.chaekit.domain.ebook.Ebook;
import qwerty.chaekit.domain.highlight.entity.Highlight;
import qwerty.chaekit.domain.highlight.repository.HighlightRepository;
import qwerty.chaekit.domain.member.publisher.PublisherProfile;
import qwerty.chaekit.domain.member.user.UserProfile;
import qwerty.chaekit.dto.highlight.HighlightFetchResponse;
import qwerty.chaekit.dto.highlight.HighlightPostRequest;
import qwerty.chaekit.dto.highlight.HighlightPostResponse;
import qwerty.chaekit.dto.highlight.HighlightPutRequest;
import qwerty.chaekit.dto.page.PageResponse;
import qwerty.chaekit.global.security.resolver.UserToken;
import qwerty.chaekit.service.highlight.HighlightService;
import qwerty.chaekit.util.TestFixtureFactory;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

@ActiveProfiles("test")
@SpringBootTest
@Transactional
class HighlightServiceTest {
    @Autowired
    private HighlightService highlightService;

    @Autowired
    private HighlightRepository highlightRepository;

    @Autowired
    private TestFixtureFactory testFixtureFactory;

    private UserProfile dummyUser;
    private Ebook dummyEbook;
    private UserToken dummyUserToken;

    @BeforeEach
    void setUp() {
        dummyUser = testFixtureFactory.createUser("user_email", "user_nickname");
        PublisherProfile dummyPublisherProfile = testFixtureFactory.createPublisher("publisher_email", "publisher_name");
        dummyEbook = testFixtureFactory.createEbook("dummy_ebook", dummyPublisherProfile, "book_author", "book_description", "book_file_key");
        dummyUserToken = testFixtureFactory.createUserToken(dummyUser.getMember(), dummyUser);
        testFixtureFactory.createEbookPurchase(dummyUser, dummyEbook);

    }

    @Test
    @DisplayName("Highlight 생성 테스트")
    void createHighlightTest() {
        // Given
        HighlightPostRequest request = HighlightPostRequest.builder()
                .bookId(dummyEbook.getId())
                .spine("spine1")
                .cfi("cfi1")
                .memo("Test Memo")
                .highlightContent("내용입니다")
                .build();

        // When
        HighlightPostResponse response = highlightService.createHighlight(dummyUserToken, request);

        // Then
        assertThat(response).isNotNull();
        assertThat(response.bookId()).isEqualTo(dummyEbook.getId());
        assertThat(response.spine()).isEqualTo("spine1");
        assertThat(response.cfi()).isEqualTo("cfi1");
        assertThat(response.memo()).isEqualTo("Test Memo");
    }

    @Test
    @DisplayName("Highlight 조회 테스트")
    void fetchHighlightsTest() {
        // Given
        Highlight highlight = highlightRepository.save(Highlight.builder()
                .author(dummyUser)
                .book(dummyEbook)
                .spine("spine1")
                .cfi("cfi1")
                .memo("Test Memo")
                        .highlightcontent("내용입니다")
                .build());

        Pageable pageable = PageRequest.of(0, 10);

        // When
        PageResponse<HighlightFetchResponse> response = highlightService.fetchHighlights(
                dummyUserToken,
                pageable,
                null,
                dummyEbook.getId(),
                "spine1",
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
                .author(dummyUser)
                .book(dummyEbook)
                .spine("spine1")
                .cfi("cfi1")
                .memo("Old Memo")
                .highlightcontent("내용입니다")
                .build());
        HighlightPutRequest request = HighlightPutRequest.builder()
                .memo("Updated Memo")
                .build();

        // When
        HighlightPostResponse response = highlightService.updateHighlight(dummyUserToken, highlight.getId(), request);

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
        Highlight highlight = highlightRepository.save(Highlight.builder()
                .author(dummyUser)
                .book(dummyEbook)
                .spine("spine1")
                .cfi("cfi1")
                .memo("Old Memo")
                .highlightcontent("내용입니다")
                .build());

        UserProfile anotherUserProfile = testFixtureFactory.createUser("another_user", "another_nickname");
        UserToken anotherUserToken = testFixtureFactory.createUserToken(anotherUserProfile.getMember(), anotherUserProfile);
        HighlightPutRequest request = HighlightPutRequest.builder()
                .memo("Updated Memo")
                .build();

        // When & Then
        assertThrows(Exception.class, () -> highlightService.updateHighlight(anotherUserToken, highlight.getId(), request));
    }
}