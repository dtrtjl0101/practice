package qwerty.chaekit.service.ebook;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import qwerty.chaekit.domain.ebook.Ebook;
import qwerty.chaekit.domain.ebook.repository.EbookRepository;
import qwerty.chaekit.domain.member.user.UserProfile;
import qwerty.chaekit.dto.ebook.EbookFetchResponse;
import qwerty.chaekit.dto.page.PageResponse;
import qwerty.chaekit.global.security.resolver.UserToken;
import qwerty.chaekit.service.util.EntityFinder;
import qwerty.chaekit.service.util.FileService;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class EbookServiceTest {

    @InjectMocks
    private EbookService ebookService;

    @Mock
    private EbookRepository ebookRepository;

    @Mock
    private FileService fileService;

    @Mock
    private EntityFinder entityFinder;

    @Test
    @DisplayName("제목과 저자로 이북 검색 성공 - 로그인 사용자")
    void fetchBooksByQuery_Success_LoggedInUser() {
        // given
        Long userId = 1L;
        String title = "Test Book";
        String author = "Test Author";
        Pageable pageable = PageRequest.of(0, 10);

        UserToken userToken = UserToken.of(userId, userId, "test@test.com");

        UserProfile user = mock(UserProfile.class);


        Ebook ebook = mock(Ebook.class);
        when(ebook.getId()).thenReturn(1L);
        when(ebook.getTitle()).thenReturn(title);
        when(ebook.getAuthor()).thenReturn(author);
        when(ebook.getCoverImageKey()).thenReturn("test-cover.jpg");

        String coverImageUrl = "http://test.com/test-cover.jpg";
        EbookFetchResponse expectedResponse = EbookFetchResponse.builder()
                .id(ebook.getId())
                .title(ebook.getTitle())
                .author(ebook.getAuthor())
                .bookCoverImageURL(coverImageUrl)
                .isPurchased(true)
                .build();

        // when
        when(entityFinder.findUser(userId)).thenReturn(user);
        when(ebookRepository.findAllByTitleAndAuthor(title, author, pageable))
                .thenReturn(new PageImpl<>(List.of(ebook)));
        when(fileService.convertToPublicImageURL(any())).thenReturn(coverImageUrl);
        when(user.isPurchased(any(Ebook.class))).thenReturn(true);

        PageResponse<EbookFetchResponse> response = ebookService.fetchBooksByQuery(userToken, pageable, title, author);

        // then
        assertThat(response.content()).hasSize(1);
        assertThat(response.content().get(0).id()).isEqualTo(ebook.getId());
        assertThat(response.content().get(0).title()).isEqualTo(title);
        assertThat(response.content().get(0).author()).isEqualTo(author);
        assertThat(response.content().get(0).bookCoverImageURL()).isEqualTo(coverImageUrl);
        assertThat(response.content().get(0).isPurchased()).isTrue();
    }

    @Test
    @DisplayName("제목과 저자로 이북 검색 성공 - 비로그인 사용자")
    void fetchBooksByQuery_Success_AnonymousUser() {
        // given
        String title = "Test Book";
        String author = "Test Author";
        Pageable pageable = PageRequest.of(0, 10);

        UserToken userToken = UserToken.of(null, null, null);


        Ebook ebook = mock(Ebook.class);
        when(ebook.getId()).thenReturn(1L);
        when(ebook.getTitle()).thenReturn(title);
        when(ebook.getAuthor()).thenReturn(author);
        when(ebook.getCoverImageKey()).thenReturn("test-cover.jpg");

        String coverImageUrl = "http://test.com/test-cover.jpg";

        // when
        when(ebookRepository.findAllByTitleAndAuthor(title, author, pageable))
                .thenReturn(new PageImpl<>(List.of(ebook)));
        when(fileService.convertToPublicImageURL(any())).thenReturn(coverImageUrl);

        PageResponse<EbookFetchResponse> response = ebookService.fetchBooksByQuery(userToken, pageable, title, author);

        // then
        assertThat(response.content()).hasSize(1);
        assertThat(response.content().get(0).id()).isEqualTo(ebook.getId());
        assertThat(response.content().get(0).title()).isEqualTo(title);
        assertThat(response.content().get(0).author()).isEqualTo(author);
        assertThat(response.content().get(0).bookCoverImageURL()).isEqualTo(coverImageUrl);
        assertThat(response.content().get(0).isPurchased()).isFalse();
    }

    @Test
    @DisplayName("이북 ID로 조회 성공")
    void fetchById_Success() {
        // given
        Long userId = 1L;
        Long ebookId = 1L;

        UserToken userToken = UserToken.of(userId, userId, "test@test.com");

        UserProfile user = mock(UserProfile.class);
        when(user.isPurchased(any(Ebook.class))).thenReturn(true);

        Ebook ebook = mock(Ebook.class);
        when(ebook.getId()).thenReturn(ebookId);
        when(ebook.getTitle()).thenReturn("Test Book");
        when(ebook.getAuthor()).thenReturn("Test Author");
        when(ebook.getCoverImageKey()).thenReturn("test-cover.jpg");

        String coverImageUrl = "http://test.com/test-cover.jpg";

        // when
        when(entityFinder.findUser(userId)).thenReturn(user);
        when(entityFinder.findEbook(ebookId)).thenReturn(ebook);
        when(fileService.convertToPublicImageURL(any())).thenReturn(coverImageUrl);

        EbookFetchResponse response = ebookService.fetchById(userToken, ebookId);

        // then
        assertThat(response.id()).isEqualTo(ebookId);
        assertThat(response.title()).isEqualTo(ebook.getTitle());
        assertThat(response.author()).isEqualTo(ebook.getAuthor());
        assertThat(response.bookCoverImageURL()).isEqualTo(coverImageUrl);
        assertThat(response.isPurchased()).isTrue();
    }



    @Test
    @DisplayName("이북 조회수 증가 성공")
    void incrementEbookViewCount_Success() {
        // given
        Long ebookId = 1L;

        // when
        ebookService.incrementEbookViewCount(ebookId);

        // then
        verify(ebookRepository).incrementViewCount(ebookId);
    }
} 