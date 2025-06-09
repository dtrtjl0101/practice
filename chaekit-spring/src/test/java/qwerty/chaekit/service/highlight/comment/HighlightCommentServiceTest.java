package qwerty.chaekit.service.highlight.comment;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import qwerty.chaekit.domain.highlight.Highlight;
import qwerty.chaekit.domain.highlight.comment.HighlightComment;
import qwerty.chaekit.domain.highlight.comment.repository.HighlightCommentRepository;
import qwerty.chaekit.domain.highlight.repository.HighlightRepository;
import qwerty.chaekit.domain.highlight.reaction.HighlightReaction;
import qwerty.chaekit.domain.highlight.reaction.repository.HighlightReactionRepository;
import qwerty.chaekit.domain.member.user.UserProfile;
import qwerty.chaekit.domain.member.user.UserProfileRepository;
import qwerty.chaekit.dto.highlight.comment.HighlightCommentRequest;
import qwerty.chaekit.dto.highlight.comment.HighlightCommentResponse;
import qwerty.chaekit.global.enums.ErrorCode;
import qwerty.chaekit.global.exception.ForbiddenException;
import qwerty.chaekit.global.exception.NotFoundException;
import qwerty.chaekit.global.security.resolver.UserToken;
import qwerty.chaekit.mapper.HighlightCommentMapper;
import qwerty.chaekit.service.group.ActivityPolicy;
import qwerty.chaekit.service.notification.NotificationService;

import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class HighlightCommentServiceTest {

    @InjectMocks
    private HighlightCommentService highlightCommentService;

    @Mock
    private HighlightRepository highlightRepository;
    @Mock
    private HighlightCommentRepository commentRepository;
    @Mock
    private HighlightReactionRepository reactionRepository;
    @Mock
    private UserProfileRepository userRepository;
    @Mock
    private NotificationService notificationService;
    @Mock
    private ActivityPolicy activityPolicy;
    @Mock
    private HighlightCommentMapper highlightCommentMapper;

    @Test
    @DisplayName("댓글생성 성공")
    void createCommentSuccess() {
        // given
        String content = "테스트 댓글";
        UserProfile userProfile = mock(UserProfile.class);
        UserProfile highlightAuthor = mock(UserProfile.class);
        UserToken userToken = UserToken.of(userProfile);
        HighlightCommentRequest request = new HighlightCommentRequest(content, null);

        Highlight highlight = mock(Highlight.class);
        HighlightComment savedComment = mock(HighlightComment.class);
        HighlightCommentResponse response = mock(HighlightCommentResponse.class);

        when(userRepository.findById(anyLong())).thenReturn(Optional.of(userProfile));
        when(highlightRepository.findById(anyLong())).thenReturn(Optional.of(highlight));
        when(highlight.isPublic()).thenReturn(true);
        when(highlight.getAuthor()).thenReturn(highlightAuthor);
        when(highlightAuthor.getId()).thenReturn(2L);
        when(userProfile.getId()).thenReturn(1L);
        when(commentRepository.save(any(HighlightComment.class))).thenReturn(savedComment);
        when(highlightCommentMapper.toResponse(savedComment)).thenReturn(response);

        // when
        HighlightCommentResponse result = highlightCommentService.createComment(userToken, 1L, request);

        // then
        assertThat(result).isEqualTo(response);
        verify(activityPolicy).assertJoined(userProfile, highlight.getActivity());
        verify(notificationService).createHighlightCommentNotification(any(), any(), any());
    }

    @Test
    @DisplayName("대댓글 생성 성공")
    void createReplySuccess() {
        // given
        Long parentId = 1L;
        String content = "테스트 대댓글";
        UserProfile userProfile = mock(UserProfile.class);
        UserProfile parentAuthor = mock(UserProfile.class);
        UserProfile highlightAuthor = mock(UserProfile.class);
        UserToken userToken = UserToken.of(userProfile);
        HighlightCommentRequest request = new HighlightCommentRequest(content, parentId);

        Highlight highlight = mock(Highlight.class);
        HighlightComment parentComment = mock(HighlightComment.class);
        HighlightComment savedComment = mock(HighlightComment.class);
        HighlightCommentResponse response = mock(HighlightCommentResponse.class);

        when(userRepository.findById(anyLong())).thenReturn(Optional.of(userProfile));
        when(highlightRepository.findById(anyLong())).thenReturn(Optional.of(highlight));
        when(highlight.isPublic()).thenReturn(true);
        when(highlight.getAuthor()).thenReturn(highlightAuthor);
        when(commentRepository.findById(parentId)).thenReturn(Optional.of(parentComment));
        when(parentComment.getHighlight()).thenReturn(highlight);
        when(parentComment.getAuthor()).thenReturn(parentAuthor);
        when(userProfile.getId()).thenReturn(1L);
        when(parentAuthor.getId()).thenReturn(2L);
        when(highlightAuthor.getId()).thenReturn(3L);
        when(commentRepository.save(any(HighlightComment.class))).thenReturn(savedComment);
        when(highlightCommentMapper.toResponse(savedComment)).thenReturn(response);

        // when
        HighlightCommentResponse result = highlightCommentService.createComment(userToken, 1L, request);

        // then
        assertThat(result).isEqualTo(response);
        verify(activityPolicy).assertJoined(userProfile, highlight.getActivity());
        verify(notificationService).createHighlightCommentReplyNotification(any(), any(), any());
    }

    @Test
    @DisplayName("댓글목록 조회 성공")
    void getCommentsSuccess() {
        // given
        UserProfile userProfile = mock(UserProfile.class);
        UserToken userToken = UserToken.of(userProfile);

        Highlight highlight = mock(Highlight.class);
        HighlightComment rootComment = mock(HighlightComment.class);
        HighlightCommentResponse response = mock(HighlightCommentResponse.class);

        when(userRepository.findById(anyLong())).thenReturn(Optional.of(userProfile));
        when(highlightRepository.findById(anyLong())).thenReturn(Optional.of(highlight));
        when(highlight.isPublic()).thenReturn(true);
        when(commentRepository.findRootCommentsByHighlightId(anyLong())).thenReturn(List.of(rootComment));
        when(rootComment.getReplies()).thenReturn(new ArrayList<>());
        when(highlightCommentMapper.toResponse(any(), any())).thenReturn(response);

        // when
        List<HighlightCommentResponse> result = highlightCommentService.getComments(userToken, 1L);

        // then
        assertThat(result).hasSize(1);
        assertThat(result.get(0)).isEqualTo(response);
        verify(activityPolicy).assertJoined(userProfile, highlight.getActivity());
    }

    @Test
    @DisplayName("없는 하이라이트에 댓글작성 실패")
    void createCommentWithNonExistentHighlight() {
        // given
        UserProfile userProfile = mock(UserProfile.class);
        UserToken userToken = UserToken.of(userProfile);
        HighlightCommentRequest request = new HighlightCommentRequest("테스트 댓글", null);

        when(userRepository.findById(anyLong())).thenReturn(Optional.of(userProfile));
        when(highlightRepository.findById(anyLong())).thenReturn(Optional.empty());

        // when
        ForbiddenException exception = assertThrows(
                ForbiddenException.class,
                () -> highlightCommentService.createComment(userToken,anyLong(),request)
        );

        // then
        assertThat(exception.getErrorCode()).isEqualTo(ErrorCode.HIGHLIGHT_NOT_FOUND.getCode());
    }

    @Test
    @DisplayName("하이라이트 댓글작성 실패")
    void createCommentOnPrivateHighlight() {
        // given
        UserProfile userProfile = mock(UserProfile.class);
        UserToken userToken = UserToken.of(userProfile);
        HighlightCommentRequest request = new HighlightCommentRequest("테스트 댓글", null);

        Highlight highlight = mock(Highlight.class);

        when(userRepository.findById(anyLong())).thenReturn(Optional.of(userProfile));
        when(highlightRepository.findById(anyLong())).thenReturn(Optional.of(highlight));
        when(highlight.isPublic()).thenReturn(false);

        // when
        ForbiddenException exception = assertThrows(
                ForbiddenException.class,
                () -> highlightCommentService.createComment(userToken,anyLong(),request)
        );

        // then
        assertThat(exception.getErrorCode()).isEqualTo(ErrorCode.HIGHLIGHT_NOT_PUBLIC.getCode());
    }

    @Test
    @DisplayName("댓글수정 성공")
    void updateCommentSuccess() {
        // given
        Long commentId = 1L;
        String newContent = "수정된 댓글";
        UserProfile userProfile = mock(UserProfile.class);
        UserToken userToken = UserToken.of(userProfile);
        HighlightCommentRequest request = new HighlightCommentRequest(newContent, null);

        HighlightComment comment = mock(HighlightComment.class);
        HighlightCommentResponse response = mock(HighlightCommentResponse.class);

        when(commentRepository.findById(commentId)).thenReturn(Optional.of(comment));
        when(comment.getAuthor()).thenReturn(userProfile);
        when(userProfile.getId()).thenReturn(1L);
        when(commentRepository.save(comment)).thenReturn(comment);
        when(highlightCommentMapper.toResponse(comment)).thenReturn(response);

        // when
        HighlightCommentResponse result = highlightCommentService.updateComment(userToken, commentId, request);

        // then
        assertThat(result).isEqualTo(response);
        verify(comment).updateContent(newContent);
    }

    @Test
    @DisplayName("댓글삭제 성공")
    void deleteCommentSuccess() {
        // given
        Long commentId = 1L;
        UserProfile userProfile = mock(UserProfile.class);
        UserToken userToken = UserToken.of(userProfile);

        HighlightComment comment = mock(HighlightComment.class);

        when(commentRepository.findById(commentId)).thenReturn(Optional.of(comment));
        when(comment.getAuthor()).thenReturn(userProfile);
        when(userProfile.getId()).thenReturn(1L);
        when(comment.getReplies()).thenReturn(new ArrayList<>());

        // when
        highlightCommentService.deleteComment(userToken, commentId);

        // then
        verify(reactionRepository).findByCommentId(commentId);
        verify(commentRepository).delete(comment);
    }

    @Test
    @DisplayName("대댓글이 있는 댓글삭제 성공")
    void deleteCommentWithRepliesSuccess() {
        // given
        Long commentId = 1L;
        UserProfile userProfile = mock(UserProfile.class);
        UserToken userToken = UserToken.of(userProfile);

        HighlightComment comment = mock(HighlightComment.class);
        HighlightComment reply = mock(HighlightComment.class);
        List<HighlightComment> replies = List.of(reply);

        when(commentRepository.findById(commentId)).thenReturn(Optional.of(comment));
        when(comment.getAuthor()).thenReturn(userProfile);
        when(userProfile.getId()).thenReturn(1L);
        when(comment.getReplies()).thenReturn(replies);
        when(reply.getId()).thenReturn(2L);
        when(reactionRepository.findByCommentId(commentId)).thenReturn(new ArrayList<>());
        when(reactionRepository.findByCommentIdIn(List.of(2L))).thenReturn(new ArrayList<>());

        // when
        highlightCommentService.deleteComment(userToken, commentId);

        // then
        verify(reactionRepository).findByCommentId(commentId);
        verify(reactionRepository).findByCommentIdIn(List.of(2L));
        verify(commentRepository).delete(comment);
    }

    @Test
    @DisplayName("없는 댓글삭제 실패")
    void deleteCommentWithNonExistentComment() {
        // given
        Long commentId = 1L;
        UserProfile userProfile = mock(UserProfile.class);
        UserToken userToken = UserToken.of(userProfile);

        when(commentRepository.findById(commentId)).thenReturn(Optional.empty());

        // when
        ForbiddenException exception = assertThrows(
                ForbiddenException.class,
                () -> highlightCommentService.deleteComment(userToken,commentId)
        );

        // then
        assertThat(exception.getErrorCode()).isEqualTo(ErrorCode.COMMENT_NOT_FOUND.getCode());
    }

    @Test
    @DisplayName("딴사람 댓글삭제 실패")
    void deleteCommentWhenNotAuthor() {
        // given
        Long commentId = 1L;
        UserProfile userProfile = mock(UserProfile.class);
        UserProfile commentAuthor = mock(UserProfile.class);
        UserToken userToken = UserToken.of(userProfile);

        HighlightComment comment = mock(HighlightComment.class);

        when(commentRepository.findById(commentId)).thenReturn(Optional.of(comment));
        when(comment.getAuthor()).thenReturn(commentAuthor);
        when(userProfile.getId()).thenReturn(1L);
        lenient().when(commentAuthor.getId()).thenReturn(2L);

        // when
        ForbiddenException exception = assertThrows(
                ForbiddenException.class,
                () -> highlightCommentService.deleteComment(userToken,commentId)
        );

        // then
        assertThat(exception.getErrorCode()).isEqualTo(ErrorCode.COMMENT_NOT_YOURS.getCode());
    }
} 