package qwerty.chaekit.service.highlight;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;
import qwerty.chaekit.domain.highlight.Highlight;
import qwerty.chaekit.domain.member.user.UserProfile;
import qwerty.chaekit.global.enums.ErrorCode;
import qwerty.chaekit.global.exception.ForbiddenException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class HighlightPolicyTest {

    @InjectMocks
    private HighlightPolicy highlightPolicy;

    @Test
    @DisplayName("하이라이트 작성자가 수정시도 성공")
    void assertUpdatableWhenAuthor() {
        // given
        UserProfile userProfile = mock(UserProfile.class);
        Highlight highlight = mock(Highlight.class);

        when(highlight.isAuthor(userProfile)).thenReturn(true);
        when(highlight.isPublic()).thenReturn(false);

        // when
        highlightPolicy.assertUpdatable(userProfile, highlight);

        // then
        // 예외가 발생하지 않음
    }

    @Test
    @DisplayName("다른 사용자가 수정 시도 실패")
    void assertUpdatableWhenNotAuthor() {
        // given
        UserProfile userProfile = mock(UserProfile.class);
        Highlight highlight = mock(Highlight.class);

        when(highlight.isAuthor(userProfile)).thenReturn(false);

        // when
        ForbiddenException exception = assertThrows(
                ForbiddenException.class,
                () -> highlightPolicy.assertUpdatable(userProfile,highlight)
        );

        // then
        assertThat(exception.getErrorCode()).isEqualTo(ErrorCode.HIGHLIGHT_NOT_YOURS.getCode());
    }

    @Test
    @DisplayName("공개된 하이라이트 수정 시도실패")
    void assertUpdatableWhenPublic() {
        // given
        UserProfile userProfile = mock(UserProfile.class);
        Highlight highlight = mock(Highlight.class);

        when(highlight.isAuthor(userProfile)).thenReturn(true);
        when(highlight.isPublic()).thenReturn(true);

        // when
        ForbiddenException exception = assertThrows(
                ForbiddenException.class,
                () -> highlightPolicy.assertUpdatable(userProfile,highlight)
        );

        // then
        assertThat(exception.getErrorCode()).isEqualTo(ErrorCode.HIGHLIGHT_ALREADY_PUBLIC.getCode());
    }

    @Test
    @DisplayName("userId로 하이라이트 작성자가 수정 시도 성공")
    void assertUpdatableWithUserIdWhenAuthor() {
        // given
        Long userId = 1L;
        Highlight highlight = mock(Highlight.class);

        when(highlight.isAuthor(any(UserProfile.class))).thenReturn(true);
        when(highlight.isPublic()).thenReturn(false);

        // when
        highlightPolicy.assertUpdatable(userId, highlight);

        // then
    }
}
