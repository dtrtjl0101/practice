package qwerty.chaekit.service.highlight.reaction;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import qwerty.chaekit.domain.group.activity.Activity;
import qwerty.chaekit.domain.highlight.Highlight;
import qwerty.chaekit.domain.highlight.comment.HighlightComment;
import qwerty.chaekit.domain.highlight.reaction.HighlightReaction;
import qwerty.chaekit.domain.highlight.reaction.ReactionType;
import qwerty.chaekit.domain.highlight.comment.repository.HighlightCommentRepository;
import qwerty.chaekit.domain.highlight.repository.HighlightRepository;
import qwerty.chaekit.domain.highlight.reaction.repository.HighlightReactionRepository;
import qwerty.chaekit.domain.member.user.UserProfile;
import qwerty.chaekit.domain.member.user.UserProfileRepository;
import qwerty.chaekit.dto.highlight.reaction.HighlightReactionRequest;
import qwerty.chaekit.dto.highlight.reaction.HighlightReactionResponse;
import qwerty.chaekit.global.enums.ErrorCode;
import qwerty.chaekit.global.exception.BadRequestException;
import qwerty.chaekit.global.exception.ForbiddenException;
import qwerty.chaekit.global.exception.NotFoundException;
import qwerty.chaekit.global.security.resolver.UserToken;
import qwerty.chaekit.service.group.ActivityPolicy;
import qwerty.chaekit.service.highlight.HighlightPolicy;
import qwerty.chaekit.service.util.EntityFinder;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.assertThrows;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class HighlightReactionServiceTest {

    @InjectMocks
    private HighlightReactionService highlightReactionService;

    @Mock
    private HighlightCommentRepository commentRepository;
    @Mock
    private HighlightReactionRepository reactionRepository;
    @Mock
    private UserProfileRepository userRepository;
    @Mock
    private ActivityPolicy activityPolicy;
    @Mock
    private HighlightPolicy highlightPolicy;
    @Mock
    private EntityFinder entityFinder;

    @Test
    @DisplayName("하이라이트에 리액션 추가 성공")
    void addReactionToHighlightSuccess() {
        // given
        Long userId = 1L;
        Long highlightId = 1L;
        UserProfile userProfile = mock(UserProfile.class);
        UserToken userToken = UserToken.of(userProfile);
        HighlightReactionRequest request = new HighlightReactionRequest(null, ReactionType.GREAT);

        Highlight highlight = mock(Highlight.class);
        HighlightReaction savedReaction = HighlightReaction.builder()
                .author(userProfile)
                .highlight(highlight)
                .reactionType(request.reactionType())
                .build();

        when(entityFinder.findUser(anyLong())).thenReturn(userProfile);
        when(entityFinder.findHighlight(highlightId)).thenReturn(highlight);
        when(highlight.isPublic()).thenReturn(true);
        when(highlight.getId()).thenReturn(highlightId);
        when(highlight.getActivity()).thenReturn(mock(Activity.class));
        when(reactionRepository.findByAuthorIdAndHighlightIdAndReactionTypeAndCommentIdIsNull(
                userId, highlightId, request.reactionType())).thenReturn(Optional.empty());
        when(reactionRepository.save(any(HighlightReaction.class))).thenReturn(savedReaction);
        when(userProfile.getId()).thenReturn(userId);

        // when
        HighlightReactionResponse result = highlightReactionService.addReaction(userToken, highlightId, request);

        // then
        assertThat(result).isNotNull();
        assertThat(result.reactionType()).isEqualTo(request.reactionType());
        verify(activityPolicy).assertJoined(userProfile, highlight.getActivity());
    }

    @Test
    @DisplayName("댓글에 리액션 추가 성공")
    void addReactionToCommentSuccess() {
        // given
        Long userId = 1L;
        Long highlightId = 1L;
        Long commentId = 1L;
        UserProfile userProfile = mock(UserProfile.class);
        UserToken userToken = UserToken.of(userProfile);
        HighlightReactionRequest request = new HighlightReactionRequest(commentId, ReactionType.GREAT);

        Highlight highlight = mock(Highlight.class);
        HighlightComment comment = mock(HighlightComment.class);
        HighlightReaction savedReaction = HighlightReaction.builder()
                .author(userProfile)
                .highlight(highlight)
                .comment(comment)
                .reactionType(request.reactionType())
                .build();

        when(entityFinder.findUser(anyLong())).thenReturn(userProfile);
        when(entityFinder.findHighlight(highlightId)).thenReturn(highlight);
        when(highlight.isPublic()).thenReturn(true);
        when(highlight.getId()).thenReturn(highlightId);
        when(highlight.getActivity()).thenReturn(mock(Activity.class));
        when(commentRepository.findById(commentId)).thenReturn(Optional.of(comment));
        when(comment.getHighlight()).thenReturn(highlight);
        when(reactionRepository.findByAuthorIdAndCommentIdAndReactionType(
                userId, commentId, request.reactionType())).thenReturn(Optional.empty());
        when(reactionRepository.save(any(HighlightReaction.class))).thenReturn(savedReaction);
        when(userProfile.getId()).thenReturn(userId);

        // when
        HighlightReactionResponse result = highlightReactionService.addReaction(userToken, highlightId, request);

        // then
        assertThat(result).isNotNull();
        assertThat(result.reactionType()).isEqualTo(request.reactionType());
        verify(activityPolicy).assertJoined(userProfile, highlight.getActivity());
        verify(commentRepository).findById(commentId);
    }

    @Test
    @DisplayName("이미 존재하는 리액션 추가 실패")
    void addReactionWhenAlreadyExists() {
        // given
        Long userId = 1L;
        Long highlightId = 1L;
        UserToken userToken = mock(UserToken.class);
        UserProfile user = mock(UserProfile.class);
        Highlight highlight = mock(Highlight.class);
        HighlightReaction existingReaction = mock(HighlightReaction.class);
        Activity activity = mock(Activity.class);

        when(userToken.userId()).thenReturn(userId);
        when(entityFinder.findUser(userId)).thenReturn(user);
        when(entityFinder.findHighlight(highlightId)).thenReturn(highlight);
        when(highlight.isPublic()).thenReturn(true);
        when(highlight.getActivity()).thenReturn(activity);
        when(reactionRepository.findByAuthorIdAndHighlightIdAndReactionTypeAndCommentIdIsNull(userId, highlightId, ReactionType.GREAT))
                .thenReturn(Optional.of(existingReaction));
        when(userRepository.getReferenceById(userId)).thenReturn(user);

        // when
        BadRequestException exception = assertThrows(
                BadRequestException.class,
                () -> highlightReactionService.addReaction(userToken, highlightId, new HighlightReactionRequest(null, ReactionType.GREAT))
        );

        // then
        assertThat(exception.getErrorCode()).isEqualTo(ErrorCode.REACTION_ALREADY_EXISTS.getCode());
    }

    @Test
    @DisplayName("리액션 목록조회 성공")
    void getHighlightReactionsSuccess() {
        // given
        Long userId = 1L;
        Long highlightId = 1L;
        UserProfile userProfile = mock(UserProfile.class);
        UserToken userToken = mock(UserToken.class);

        Highlight highlight = mock(Highlight.class);
        Activity activity = mock(Activity.class);
        HighlightReaction reaction = HighlightReaction.builder()
                .author(userProfile)
                .highlight(highlight)
                .reactionType(ReactionType.GREAT)
                .build();

        when(entityFinder.findHighlight(highlightId)).thenReturn(highlight);
        when(highlight.isPublic()).thenReturn(true);
        when(highlight.getActivity()).thenReturn(activity);
        when(activity.getId()).thenReturn(1L);
        when(reactionRepository.findByHighlightIdAndCommentIdIsNull(highlightId)).thenReturn(List.of(reaction));
        when(userProfile.getId()).thenReturn(userId);
        when(userProfile.getNickname()).thenReturn("testUser");
        when(userToken.userId()).thenReturn(userId);

        // when
        List<HighlightReactionResponse> result = highlightReactionService.getHighlightReactions(userToken, highlightId);

        // then
        verify(activityPolicy).assertJoined(userId, highlight.getActivity().getId());
        assertThat(result).hasSize(1);
        assertThat(result.get(0).authorId()).isEqualTo(userId);
        assertThat(result.get(0).authorName()).isEqualTo("testUser");
        assertThat(result.get(0).reactionType()).isEqualTo(ReactionType.GREAT);
    }

    @Test
    @DisplayName("리액션 삭제성공")
    void deleteReactionSuccess() {
        // given
        Long userId = 1L;
        Long reactionId = 1L;
        UserProfile userProfile = mock(UserProfile.class);
        UserToken userToken = mock(UserToken.class);

        HighlightReaction reaction = mock(HighlightReaction.class);

        when(reactionRepository.findById(reactionId)).thenReturn(Optional.of(reaction));
        when(reaction.getAuthor()).thenReturn(userProfile);
        when(userProfile.getId()).thenReturn(1L);
        when(userToken.userId()).thenReturn(1L);

        // when
        highlightReactionService.deleteReaction(userToken, reactionId);

        // then
        verify(reactionRepository).delete(reaction);
    }

    @Test
    @DisplayName("딴사람 리액션 삭제실패")
    void deleteReactionWhenNotAuthor() {
        // given
        Long userId = 1L;
        Long reactionId = 1L;
        UserProfile userProfile = mock(UserProfile.class);
        UserProfile reactionAuthor = mock(UserProfile.class);
        UserToken userToken = UserToken.of(userProfile);

        HighlightReaction reaction = mock(HighlightReaction.class);

        when(reactionRepository.findById(reactionId)).thenReturn(Optional.of(reaction));
        when(reaction.getAuthor()).thenReturn(reactionAuthor);
        when(reactionAuthor.getId()).thenReturn(2L);
        when(userProfile.getId()).thenReturn(userId);

        // when
        ForbiddenException exception = assertThrows(
                ForbiddenException.class,
                () -> highlightReactionService.deleteReaction(userToken, reactionId)
        );

        // then
        assertThat(exception.getErrorCode()).isEqualTo(ErrorCode.NOT_REACTION_AUTHOR.getCode());
    }

    @Test
    @DisplayName("비공개 하이라이트에 리액션 추가 실패")
    void addReactionToPrivateHighlightFail() {
        // given
        Long userId = 1L;
        Long highlightId = 1L;
        UserProfile userProfile = mock(UserProfile.class);
        UserToken userToken = UserToken.of(userProfile);
        HighlightReactionRequest request = new HighlightReactionRequest(null, ReactionType.GREAT);

        Highlight highlight = mock(Highlight.class);

        when(entityFinder.findUser(userId)).thenReturn(userProfile);
        when(entityFinder.findHighlight(highlightId)).thenReturn(highlight);
        when(highlight.isPublic()).thenReturn(false);

        // when
        ForbiddenException exception = assertThrows(
                ForbiddenException.class,
                () -> highlightReactionService.addReaction(userToken, highlightId, request)
        );

        // then
        assertThat(exception.getErrorCode()).isEqualTo(ErrorCode.HIGHLIGHT_NOT_PUBLIC.getCode());
    }

    @Test
    @DisplayName("존재하지 않는 댓글에 리액션 추가 실패")
    void addReactionToNonExistentCommentFail() {
        // given
        Long userId = 1L;
        Long highlightId = 1L;
        Long commentId = 999L;
        UserProfile userProfile = mock(UserProfile.class);
        UserToken userToken = UserToken.of(userProfile);
        HighlightReactionRequest request = new HighlightReactionRequest(commentId, ReactionType.GREAT);

        Highlight highlight = mock(Highlight.class);

        when(entityFinder.findUser(anyLong())).thenReturn(userProfile);
        when(entityFinder.findHighlight(highlightId)).thenReturn(highlight);
        when(highlight.isPublic()).thenReturn(true);
        when(commentRepository.findById(commentId)).thenReturn(Optional.empty());

        // when
        NotFoundException exception = assertThrows(
                NotFoundException.class,
                () -> highlightReactionService.addReaction(userToken, highlightId, request)
        );

        // then
        assertThat(exception.getErrorCode()).isEqualTo(ErrorCode.COMMENT_NOT_FOUND.getCode());
    }

    @Test
    @DisplayName("다른 하이라이트의 댓글에 리액션 추가 실패")
    void addReactionToCommentFromDifferentHighlightFail() {
        // given
        Long userId = 1L;
        Long highlightId = 1L;
        Long commentId = 1L;
        Long differentHighlightId = 2L;
        UserProfile userProfile = mock(UserProfile.class);
        UserToken userToken = UserToken.of(userProfile);
        HighlightReactionRequest request = new HighlightReactionRequest(commentId, ReactionType.GREAT);

        Highlight highlight = mock(Highlight.class);
        Highlight differentHighlight = mock(Highlight.class);
        HighlightComment comment = mock(HighlightComment.class);

        when(entityFinder.findUser(anyLong())).thenReturn(userProfile);
        when(entityFinder.findHighlight(highlightId)).thenReturn(highlight);
        when(highlight.isPublic()).thenReturn(true);
        when(commentRepository.findById(commentId)).thenReturn(Optional.of(comment));
        when(comment.getHighlight()).thenReturn(differentHighlight);
        when(differentHighlight.getId()).thenReturn(differentHighlightId);

        // when
        ForbiddenException exception = assertThrows(
                ForbiddenException.class,
                () -> highlightReactionService.addReaction(userToken, highlightId, request)
        );

        // then
        assertThat(exception.getErrorCode()).isEqualTo(ErrorCode.COMMENT_PARENT_MISMATCH.getCode());
    }

    @Test
    @DisplayName("비공개 하이라이트의 리액션 목록 조회 실패")
    void getReactionsFromPrivateHighlightFail() {
        // given
        Long userId = 1L;
        Long highlightId = 1L;
        UserProfile userProfile = mock(UserProfile.class);
        UserToken userToken = mock(UserToken.class);

        Highlight highlight = mock(Highlight.class);

        when(entityFinder.findHighlight(highlightId)).thenReturn(highlight);
        when(highlight.isPublic()).thenReturn(false);
        when(userProfile.getId()).thenReturn(userId);
        when(userToken.userId()).thenReturn(userId);

        // when
        highlightReactionService.getHighlightReactions(userToken, highlightId);

        // then
        verify(highlightPolicy).assertUpdatable(userId, highlight);
    }
}