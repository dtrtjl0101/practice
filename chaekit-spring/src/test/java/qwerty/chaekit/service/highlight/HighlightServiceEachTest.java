package qwerty.chaekit.service.highlight;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import qwerty.chaekit.domain.ebook.Ebook;
import qwerty.chaekit.domain.group.activity.Activity;
import qwerty.chaekit.domain.group.activity.discussion.Discussion;
import qwerty.chaekit.domain.group.activity.discussion.highlight.DiscussionHighlight;
import qwerty.chaekit.domain.group.activity.discussion.highlight.DiscussionHighlightRepository;
import qwerty.chaekit.domain.highlight.Highlight;
import qwerty.chaekit.domain.highlight.repository.HighlightRepository;
import qwerty.chaekit.domain.member.user.UserProfile;
import qwerty.chaekit.dto.highlight.HighlightFetchResponse;
import qwerty.chaekit.dto.highlight.HighlightPostRequest;
import qwerty.chaekit.dto.highlight.HighlightPostResponse;
import qwerty.chaekit.dto.highlight.HighlightPutRequest;
import qwerty.chaekit.dto.page.PageResponse;
import qwerty.chaekit.global.enums.ErrorCode;
import qwerty.chaekit.global.exception.BadRequestException;
import qwerty.chaekit.global.exception.ForbiddenException;
import qwerty.chaekit.global.security.resolver.UserToken;
import qwerty.chaekit.service.ebook.EbookPolicy;
import qwerty.chaekit.service.group.ActivityPolicy;
import qwerty.chaekit.service.util.EntityFinder;
import qwerty.chaekit.service.util.FileService;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class HighlightServiceEachTest {

    @InjectMocks
    private HighlightService highlightService;

    @Mock
    private HighlightRepository highlightRepository;
    @Mock
    private DiscussionHighlightRepository discussionHighlightRepository;
    @Mock
    private ActivityPolicy activityPolicy;
    @Mock
    private HighlightPolicy highlightPolicy;
    @Mock
    private EntityFinder entityFinder;
    @Mock
    private FileService fileService;
    @Mock
    private EbookPolicy ebookPolicy;

    @Test
    @DisplayName("하이라이트 생성 성공 - 공개")
    void createHighlightSuccess_Public() {
        // given
        Long userId = 1L;
        Long activityId = 1L;
        Long bookId = 1L;
        UserProfile user = mock(UserProfile.class);
        UserToken userToken = mock(UserToken.class);
        Activity activity = mock(Activity.class);
        Ebook ebook = mock(Ebook.class);

        HighlightPostRequest request = new HighlightPostRequest(
                bookId, "spine", "cfi", 1L,"memo", "highlightContent"
        );

        Highlight highlight = mock(Highlight.class);

        when(userToken.userId()).thenReturn(userId);
        when(entityFinder.findUser(userId)).thenReturn(user);
        when(entityFinder.findEbook(bookId)).thenReturn(ebook);
        when(entityFinder.findActivity(activityId)).thenReturn(activity);
        when(highlightRepository.save(any(Highlight.class))).thenReturn(highlight);

        // when
        HighlightPostResponse response = highlightService.createHighlight(userToken, request);

        // then
        assertThat(response).isNotNull();
        verify(activityPolicy).assertJoined(user, activity);
        verify(highlightRepository).save(any(Highlight.class));
    }

    @Test
    @DisplayName("하이라이트 생성 성공 - 비공개")
    void createHighlightSuccess_Private() {
        // given
        Long userId = 1L;
        Long bookId = 1L;
        UserProfile user = mock(UserProfile.class);
        UserToken userToken = mock(UserToken.class);
        Ebook ebook = mock(Ebook.class);

        HighlightPostRequest request = new HighlightPostRequest(
                bookId, "spine", "cfi", null,"memo", "highlightContent"
        );

        Highlight highlight = mock(Highlight.class);

        when(userToken.userId()).thenReturn(userId);
        when(entityFinder.findUser(userId)).thenReturn(user);
        when(entityFinder.findEbook(bookId)).thenReturn(ebook);
        when(highlightRepository.save(any(Highlight.class))).thenReturn(highlight);

        // when
        HighlightPostResponse response = highlightService.createHighlight(userToken, request);

        // then
        assertThat(response).isNotNull();
        verify(ebookPolicy).assertEBookPurchased(user, ebook);
        verify(highlightRepository).save(any(Highlight.class));
    }

    @Test
    @DisplayName("하이라이트 목록 조회 실패")
    void fetchHighlightsFail_SpineWithoutBookId() {
        // given
        Long userId = 1L;
        UserToken userToken = mock(UserToken.class);
        Pageable pageable = PageRequest.of(0, 10);

        when(userToken.userId()).thenReturn(userId);

        // when
        BadRequestException exception = assertThrows(
                BadRequestException.class,
                () -> highlightService.fetchHighlights(userToken, pageable, null, null, "spine", false,"me")
        );

        // then
        assertThat(exception.getErrorCode()).isEqualTo(ErrorCode.BOOK_ID_REQUIRED.getCode());
    }

    @Test
    @DisplayName("하이라이트 수정 성공")
    void updateHighlightSuccess() {
        // given
        Long userId = 1L;
        Long highlightId = 1L;
        Long newActivityId = 2L;
        UserProfile user = mock(UserProfile.class);
        UserToken userToken = mock(UserToken.class);
        Highlight highlight = mock(Highlight.class);
        Activity newActivity = mock(Activity.class);

        HighlightPutRequest request = new HighlightPutRequest(newActivityId, "newMemo");

        when(userToken.userId()).thenReturn(userId);
        when(entityFinder.findUser(userId)).thenReturn(user);
        when(entityFinder.findHighlight(highlightId)).thenReturn(highlight);
        when(entityFinder.findActivity(newActivityId)).thenReturn(newActivity);
        when(highlightRepository.save(any(Highlight.class))).thenReturn(highlight);

        // when
        HighlightPostResponse response = highlightService.updateHighlight(userToken, highlightId, request);

        // then
        assertThat(response).isNotNull();
        verify(highlightPolicy).assertUpdatable(user, highlight);
        verify(activityPolicy).assertJoined(user, newActivity);
        verify(highlight).setAsPublicActivity(newActivity);
        verify(highlight).updateMemo("newMemo");
    }

    @Test
    @DisplayName("하이라이트 삭제 성공")
    void deleteHighlightSuccess() {
        // given
        Long userId = 1L;
        Long highlightId = 1L;
        UserProfile user = mock(UserProfile.class);
        UserToken userToken = mock(UserToken.class);
        Highlight highlight = mock(Highlight.class);

        when(userToken.userId()).thenReturn(userId);
        when(entityFinder.findUser(userId)).thenReturn(user);
        when(entityFinder.findHighlight(highlightId)).thenReturn(highlight);

        // when
        highlightService.deleteHighlight(userToken, highlightId);

        // then
        verify(highlightPolicy).assertUpdatable(user, highlight);
        verify(highlightRepository).delete(highlight);
    }
    @Test
    @DisplayName("하이라이트 조회 성공 - 작성자")
    void fetchHighlightSuccess_Author() {
        // given
        Long userId = 1L;
        Long highlightId = 1L;
        UserProfile user = mock(UserProfile.class);
        UserToken userToken = mock(UserToken.class);
        Highlight highlight = mock(Highlight.class);
        List<DiscussionHighlight> discussionHighlights = List.of();

        when(userToken.userId()).thenReturn(userId);
        when(entityFinder.findUser(userId)).thenReturn(user);
        when(entityFinder.findHighlight(highlightId)).thenReturn(highlight);
        when(highlight.isAuthor(user)).thenReturn(true);
        when(discussionHighlightRepository.findByHighlight(highlight)).thenReturn(discussionHighlights);
        when(highlight.getAuthor()).thenReturn(user);
        when(user.getProfileImageKey()).thenReturn("profileImageKey");
        when(fileService.convertToPublicImageURL("profileImageKey")).thenReturn("profileImageURL");

        // when
        HighlightFetchResponse response = highlightService.fetchHighlight(userToken, highlightId);

        // then
        assertThat(response).isNotNull();
        verify(discussionHighlightRepository).findByHighlight(highlight);
    }

    @Test
    @DisplayName("하이라이트 조회 실패1")
    void fetchHighlightFail_PrivateHighlight() {
        // given
        Long userId = 1L;
        Long highlightId = 1L;
        UserProfile user = mock(UserProfile.class);
        UserToken userToken = mock(UserToken.class);
        Highlight highlight = mock(Highlight.class);

        when(userToken.userId()).thenReturn(userId);
        when(entityFinder.findUser(userId)).thenReturn(user);
        when(entityFinder.findHighlight(highlightId)).thenReturn(highlight);
        when(highlight.isAuthor(user)).thenReturn(false);
        when(highlight.isPublic()).thenReturn(false);

        // when
        ForbiddenException exception = assertThrows(
                ForbiddenException.class,
                () -> highlightService.fetchHighlight(userToken, highlightId)
        );

        // then
        assertThat(exception.getErrorCode()).isEqualTo(ErrorCode.HIGHLIGHT_NOT_SEE.getCode());
    }
}