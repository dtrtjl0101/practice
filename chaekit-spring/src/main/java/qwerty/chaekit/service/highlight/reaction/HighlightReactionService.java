package qwerty.chaekit.service.highlight.reaction;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import qwerty.chaekit.domain.highlight.Highlight;
import qwerty.chaekit.domain.highlight.comment.HighlightComment;
import qwerty.chaekit.domain.highlight.reaction.HighlightReaction;
import qwerty.chaekit.domain.highlight.repository.HighlightRepository;
import qwerty.chaekit.domain.highlight.comment.repository.HighlightCommentRepository;
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

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class HighlightReactionService {
    //private final HighlightRepository highlightRepository;
    private final HighlightCommentRepository commentRepository;
    private final HighlightReactionRepository reactionRepository;
    private final UserProfileRepository userRepository;
    private final ActivityPolicy activityPolicy;
    private final HighlightPolicy highlightPolicy;
    private final EntityFinder entityFinder;

    public HighlightReactionResponse addReaction(UserToken userToken, Long highlightId, HighlightReactionRequest request) {
        Long userId = userToken.userId();

        UserProfile author = entityFinder.findUser(userId);
        Highlight highlight = entityFinder.findHighlight(highlightId);

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

        return HighlightReactionResponse.of(savedReaction);
    }

    public List<HighlightReactionResponse> getHighlightReactions(UserToken userToken, Long highlightId) {
        Highlight highlight = entityFinder.findHighlight(highlightId);
        if(highlight.isPublic()) {
            activityPolicy.assertJoined(userToken.userId(), highlight.getActivity().getId());
        } else {
            highlightPolicy.assertUpdatable(userToken.userId(), highlight);
        }

        List<HighlightReaction> reactions = reactionRepository.findByHighlightIdAndCommentIdIsNull(highlightId);

        return reactions.stream()
                .map(HighlightReactionResponse::of)
                .collect(Collectors.toList());
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