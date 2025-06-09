package qwerty.chaekit.service.highlight.reaction;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
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
import qwerty.chaekit.global.security.resolver.UserToken;
import qwerty.chaekit.service.group.ActivityPolicy;
import qwerty.chaekit.service.highlight.HighlightPolicy;
import qwerty.chaekit.service.util.EntityFinder;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.assertThrows;

@ExtendWith(MockitoExtension.class)
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
        HighlightReaction savedReaction = mock(HighlightReaction.class);
        HighlightReactionResponse response = mock(HighlightReactionResponse.class);

        when(entityFinder.findUser(userId)).thenReturn(userProfile);
        when(entityFinder.findHighlight(highlightId)).thenReturn(highlight);
        when(highlight.isPublic()).thenReturn(true);
        when(reactionRepository.findByAuthorIdAndHighlightIdAndReactionTypeAndCommentIdIsNull(
                userId, highlightId, request.reactionType())).thenReturn(Optional.empty());
        when(reactionRepository.save(any(HighlightReaction.class))).thenReturn(savedReaction);
        when(HighlightReactionResponse.of(savedReaction)).thenReturn(response);

        // when
        HighlightReactionResponse result = highlightReactionService.addReaction(userToken, highlightId, request);

        // then
        assertThat(result).isEqualTo(response);
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
        HighlightReaction savedReaction = mock(HighlightReaction.class);
        HighlightReactionResponse response = mock(HighlightReactionResponse.class);

        when(entityFinder.findUser(userId)).thenReturn(userProfile);
        when(entityFinder.findHighlight(highlightId)).thenReturn(highlight);
        when(highlight.isPublic()).thenReturn(true);
        when(commentRepository.findById(commentId)).thenReturn(Optional.of(comment));
        when(comment.getHighlight()).thenReturn(highlight);
        when(highlight.getId()).thenReturn(highlightId);
        when(reactionRepository.findByAuthorIdAndCommentIdAndReactionType(
                userId, commentId, request.reactionType())).thenReturn(Optional.empty());
        when(reactionRepository.save(any(HighlightReaction.class))).thenReturn(savedReaction);
        when(HighlightReactionResponse.of(savedReaction)).thenReturn(response);

        // when
        HighlightReactionResponse result = highlightReactionService.addReaction(userToken, highlightId, request);

        // then
        assertThat(result).isEqualTo(response);
        verify(activityPolicy).assertJoined(userProfile, highlight.getActivity());
    }

    @Test
    @DisplayName("이미 존재하는 리액션 추가 실패")
    void addReactionWhenAlreadyExists() {
        // given
        Long userId = 1L;
        Long highlightId = 1L;
        UserProfile userProfile = mock(UserProfile.class);
        UserToken userToken = UserToken.of(userProfile);
        HighlightReactionRequest request = new HighlightReactionRequest(null, ReactionType.GREAT);

        Highlight highlight = mock(Highlight.class);
        HighlightReaction existingReaction = mock(HighlightReaction.class);

        when(entityFinder.findUser(userId)).thenReturn(userProfile);
        when(entityFinder.findHighlight(highlightId)).thenReturn(highlight);
        when(highlight.isPublic()).thenReturn(true);
        when(reactionRepository.findByAuthorIdAndHighlightIdAndReactionTypeAndCommentIdIsNull(
                userId, highlightId, request.reactionType())).thenReturn(Optional.of(existingReaction));

        // when & then
        assertThatThrownBy(() -> highlightReactionService.addReaction(userToken, highlightId, request))
                .isInstanceOf(BadRequestException.class)
                .satisfies(exception -> {
                    BadRequestException badRequestException = (BadRequestException) exception;
                    assertThat(badRequestException.getErrorCode()).isEqualTo(ErrorCode.REACTION_ALREADY_EXISTS);
                });
    }

    @Test
    @DisplayName("리액션 목록조회 성공")
    void getHighlightReactionsSuccess() {
        // given
        Long userId = 1L;
        Long highlightId = 1L;
        UserProfile userProfile = mock(UserProfile.class);
        UserToken userToken = UserToken.of(userProfile);

        Highlight highlight = mock(Highlight.class);
        HighlightReaction reaction = mock(HighlightReaction.class);
        HighlightReactionResponse response = mock(HighlightReactionResponse.class);

        when(entityFinder.findHighlight(highlightId)).thenReturn(highlight);
        when(highlight.isPublic()).thenReturn(true);
        when(reactionRepository.findByHighlightIdAndCommentIdIsNull(highlightId)).thenReturn(List.of(reaction));
        when(HighlightReactionResponse.of(reaction)).thenReturn(response);

        // when
        List<HighlightReactionResponse> result = highlightReactionService.getHighlightReactions(userToken, highlightId);

        // then
        verify(activityPolicy).assertJoined(userId, highlight.getActivity().getId());
        assertThat(result).hasSize(1);
        assertThat(result.get(0)).isEqualTo(response);
    }

    @Test
    @DisplayName("리액션 삭제성공")
    void deleteReactionSuccess() {
        // given
        Long userId = 1L;
        Long reactionId = 1L;
        UserProfile userProfile = mock(UserProfile.class);
        UserToken userToken = UserToken.of(userProfile);

        HighlightReaction reaction = mock(HighlightReaction.class);

        when(reactionRepository.findById(reactionId)).thenReturn(Optional.of(reaction));
        when(reaction.getAuthor()).thenReturn(userProfile);
        when(userProfile.getId()).thenReturn(userId);

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
} 