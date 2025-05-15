package qwerty.chaekit.service.highlight.reaction;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import qwerty.chaekit.domain.highlight.entity.Highlight;
import qwerty.chaekit.domain.highlight.entity.comment.HighlightComment;
import qwerty.chaekit.domain.highlight.entity.reaction.HighlightReaction;
import qwerty.chaekit.domain.highlight.repository.HighlightRepository;
import qwerty.chaekit.domain.highlight.repository.comment.HighlightCommentRepository;
import qwerty.chaekit.domain.highlight.repository.reaction.HighlightReactionRepository;
import qwerty.chaekit.domain.member.user.UserProfile;
import qwerty.chaekit.domain.member.user.UserProfileRepository;
import qwerty.chaekit.dto.highlight.reaction.ReactionRequest;
import qwerty.chaekit.dto.highlight.reaction.ReactionResponse;
import qwerty.chaekit.global.enums.ErrorCode;
import qwerty.chaekit.global.exception.BadRequestException;
import qwerty.chaekit.global.exception.ForbiddenException;
import qwerty.chaekit.global.exception.NotFoundException;
import qwerty.chaekit.global.security.resolver.UserToken;
import qwerty.chaekit.service.group.ActivityPolicy;

import java.util.Optional;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class HighlightReactionService {
    private final HighlightRepository highlightRepository;
    private final HighlightCommentRepository commentRepository;
    private final HighlightReactionRepository reactionRepository;
    private final UserProfileRepository userRepository;
    private final ActivityPolicy activityPolicy;

    public ReactionResponse addReaction(UserToken userToken, Long highlightId, ReactionRequest request) {
        Long userId = userToken.userId();

        UserProfile author = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException(ErrorCode.USER_NOT_FOUND));

        Highlight highlight = highlightRepository.findById(highlightId)
                .orElseThrow(() -> new NotFoundException(ErrorCode.HIGHLIGHT_NOT_FOUND));

        activityPolicy.assertJoined(author, highlight.getActivity());
        
        if (!highlight.isPublic()) {
            throw new ForbiddenException(ErrorCode.HIGHLIGHT_NOT_PUBLIC);
        }

        HighlightComment comment = null;
        Optional<HighlightReaction> highlightReaction;

        if (request.commentId() != null) {
            comment = commentRepository.findById(request.commentId())
                    .orElseThrow(() -> new NotFoundException(ErrorCode.COMMENT_NOT_FOUND));

            if (!comment.getHighlight().getId().equals(highlightId)) {
                throw new ForbiddenException(ErrorCode.COMMENT_PARENT_MISMATCH);
            }

            highlightReaction = reactionRepository.findByAuthorIdAndCommentIdAndReactionType(
                    userId, comment.getId(), request.reactionType());
        } else {
            highlightReaction = reactionRepository.findByAuthorIdAndHighlightIdAndReactionTypeAndCommentIdIsNull(
                    userId, highlightId, request.reactionType());
        }
        
        if (highlightReaction.isPresent()) {
            throw new BadRequestException(ErrorCode.REACTION_ALREADY_EXISTS);
        }

        HighlightReaction reaction = HighlightReaction.builder()
                .author(userRepository.getReferenceById(userId))
                .highlight(highlight)
                .comment(comment)
                .reactionType(request.reactionType())
                .build();

        HighlightReaction savedReaction = reactionRepository.save(reaction);

        return ReactionResponse.of(savedReaction);
    }

    public void deleteReaction(UserToken userToken, Long reactionId) {
        Long userId = userToken.userId();

        HighlightReaction reaction = reactionRepository.findById(reactionId)
                .orElseThrow(() -> new NotFoundException(ErrorCode.REACTION_NOT_FOUND));

        if (!reaction.getAuthor().getId().equals(userId)) {
            throw new ForbiddenException(ErrorCode.NOT_REACTION_AUTHOR);
        }

        reactionRepository.delete(reaction);
    }
}