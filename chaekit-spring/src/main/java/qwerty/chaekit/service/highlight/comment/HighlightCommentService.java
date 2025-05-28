package qwerty.chaekit.service.highlight.comment;

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
import java.util.stream.Collectors;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class HighlightCommentService {
    private final HighlightRepository highlightRepository;
    private final HighlightCommentRepository commentRepository;
    private final HighlightReactionRepository reactionRepository;
    private final UserProfileRepository userRepository;
    private final NotificationService notificationService;
    private final ActivityPolicy activityPolicy;
    private final HighlightCommentMapper highlightCommentMapper;

    public HighlightCommentResponse createComment(UserToken userToken, Long highlightId, HighlightCommentRequest request) {
        Long userId = userToken.userId();

        UserProfile commentAuthor = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException(ErrorCode.USER_NOT_FOUND));

        Highlight highlight = highlightRepository.findById(highlightId)
                .orElseThrow(() -> new NotFoundException(ErrorCode.HIGHLIGHT_NOT_FOUND));

        activityPolicy.assertJoined(commentAuthor, highlight.getActivity());
        
        if (!highlight.isPublic()) {
            throw new ForbiddenException(ErrorCode.HIGHLIGHT_NOT_PUBLIC);
        }
        
        HighlightComment parent;
        if (request.parentId() != null) {
            parent = commentRepository.findById(request.parentId())
                    .orElseThrow(() -> new NotFoundException(ErrorCode.COMMENT_NOT_FOUND));

            if (!parent.getHighlight().getId().equals(highlightId)) {
                throw new ForbiddenException(ErrorCode.COMMENT_PARENT_MISMATCH);
            }
        } else {
            parent = null;
        }
        
        HighlightComment comment = HighlightComment.builder()
                .author(commentAuthor)
                .highlight(highlight)
                .content(request.content())
                .parent(parent)
                .build();
        
        HighlightComment savedComment = commentRepository.save(comment);
        
        if (parent != null) {
            parent.addReply(savedComment);
        }

        if (parent != null) {
            if (!parent.getAuthor().getId().equals(userId)) {
                notificationService.createHighlightCommentReplyNotification(parent.getAuthor(), commentAuthor, parent);
            }
            if (!highlight.getAuthor().getId().equals(userId) && !highlight.getAuthor().getId().equals(parent.getAuthor().getId())) {
                notificationService.createHighlightCommentReplyNotification(highlight.getAuthor(), commentAuthor, parent);
            }
        } else {
            if (!highlight.getAuthor().getId().equals(userId)) {
                notificationService.createHighlightCommentNotification(highlight.getAuthor(), commentAuthor, highlight);
            }
        }
        
        return highlightCommentMapper.toResponse(savedComment);
    }
    
    @Transactional(readOnly = true)
    public List<HighlightCommentResponse> getComments(UserToken userToken, Long highlightId) {
        UserProfile author = userRepository.findById(userToken.userId())
                .orElseThrow(() -> new NotFoundException(ErrorCode.USER_NOT_FOUND));
        
        Highlight highlight = highlightRepository.findById(highlightId)
                .orElseThrow(() -> new NotFoundException(ErrorCode.HIGHLIGHT_NOT_FOUND));
        
        if (!highlight.isPublic()) {
            throw new ForbiddenException(ErrorCode.HIGHLIGHT_NOT_PUBLIC);
        }

        activityPolicy.assertJoined(author, highlight.getActivity());

        List<HighlightComment> rootComments = commentRepository.findRootCommentsByHighlightId(highlightId);

        Set<Long> allCommentIds = new HashSet<>();
        for (HighlightComment rootComment : rootComments) {
            allCommentIds.add(rootComment.getId());
            for (HighlightComment reply : rootComment.getReplies()) {
                allCommentIds.add(reply.getId());
            }
        }

        final Map<Long, List<HighlightReaction>> reactionsByCommentId;
        
        if (!allCommentIds.isEmpty()) {
            List<HighlightReaction> allReactions = reactionRepository.findByCommentIdIn(new ArrayList<>(allCommentIds));
            reactionsByCommentId = allReactions.stream()
                    .collect(Collectors.groupingBy(reaction -> reaction.getComment().getId()));
        } else {
            reactionsByCommentId = Collections.emptyMap();
        }

        return rootComments.stream()
                .map(comment -> highlightCommentMapper.toResponse(comment, reactionsByCommentId))
                .collect(Collectors.toList());
    }
    
    public HighlightCommentResponse updateComment(UserToken userToken, Long commentId, HighlightCommentRequest request) {
        Long userId = userToken.userId();
        
        HighlightComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new NotFoundException(ErrorCode.COMMENT_NOT_FOUND));
        
        if (!comment.getAuthor().getId().equals(userId)) {
            throw new ForbiddenException(ErrorCode.COMMENT_NOT_YOURS);
        }
        
        comment.updateContent(request.content());
        return highlightCommentMapper.toResponse(commentRepository.save(comment));
    }
    
    public void deleteComment(UserToken userToken, Long commentId) {
        Long userId = userToken.userId();
        
        HighlightComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new NotFoundException(ErrorCode.COMMENT_NOT_FOUND));
        
        if (!comment.getAuthor().getId().equals(userId)) {
            throw new ForbiddenException(ErrorCode.COMMENT_NOT_YOURS);
        }

        List<HighlightReaction> reactions = reactionRepository.findByCommentId(commentId);
        for (HighlightReaction reaction : reactions) {
            reactionRepository.delete(reaction);
        }

        if (!comment.getReplies().isEmpty()) {
            List<Long> replyIds = comment.getReplies().stream()
                    .map(HighlightComment::getId)
                    .collect(Collectors.toList());
            
            List<HighlightReaction> replyReactions = reactionRepository.findByCommentIdIn(replyIds);
            for (HighlightReaction reaction : replyReactions) {
                reactionRepository.delete(reaction);
            }
        }
        
        commentRepository.delete(comment);
    }
} 