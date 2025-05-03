package qwerty.chaekit.service.highlight.comment;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import qwerty.chaekit.domain.highlight.entity.Highlight;
import qwerty.chaekit.domain.highlight.entity.comment.HighlightComment;
import qwerty.chaekit.domain.highlight.repository.HighlightRepository;
import qwerty.chaekit.domain.highlight.repository.comment.HighlightCommentRepository;
import qwerty.chaekit.domain.member.user.UserProfileRepository;
import qwerty.chaekit.dto.highlight.comment.CommentRequest;
import qwerty.chaekit.dto.highlight.comment.CommentResponse;
import qwerty.chaekit.global.enums.ErrorCode;
import qwerty.chaekit.global.exception.ForbiddenException;
import qwerty.chaekit.global.exception.NotFoundException;
import qwerty.chaekit.global.security.resolver.UserToken;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class CommentService {
    private final HighlightRepository highlightRepository;
    private final HighlightCommentRepository commentRepository;
    private final UserProfileRepository userRepository;

    public CommentResponse createComment(UserToken userToken, Long highlightId, CommentRequest request) {
        Long userId = userToken.userId();
        
        if (!userRepository.existsById(userId)) {
            throw new NotFoundException(ErrorCode.USER_NOT_FOUND);
        }
        
        Highlight highlight = highlightRepository.findById(highlightId)
                .orElseThrow(() -> new NotFoundException(ErrorCode.HIGHLIGHT_NOT_FOUND));
        
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
        }else{
            parent=null;
        }
        
        HighlightComment comment = HighlightComment.builder()
                .author(userRepository.getReferenceById(userId))
                .highlight(highlight)
                .content(request.content())
                .parent(parent)
                .build();
        
        HighlightComment savedComment = commentRepository.save(comment);
        
        if (parent != null) {
            parent.addReply(savedComment);
        }
        
        return CommentResponse.of(savedComment);
    }
    
    @Transactional(readOnly = true)
    public List<CommentResponse> getComments(Long highlightId) {
        Highlight highlight = highlightRepository.findById(highlightId)
                .orElseThrow(() -> new NotFoundException(ErrorCode.HIGHLIGHT_NOT_FOUND));
        
        if (!highlight.isPublic()) {
            throw new ForbiddenException(ErrorCode.HIGHLIGHT_NOT_PUBLIC);
        }
        
        List<HighlightComment> rootComments = commentRepository.findRootCommentsByHighlightId(highlightId);
        return rootComments.stream()
                .map(CommentResponse::of)
                .collect(Collectors.toList());
    }
    
    public CommentResponse updateComment(UserToken userToken, Long commentId, CommentRequest request) {
        Long userId = userToken.userId();
        
        HighlightComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new NotFoundException(ErrorCode.COMMENT_NOT_FOUND));
        
        if (!comment.getAuthor().getId().equals(userId)) {
            throw new ForbiddenException(ErrorCode.COMMENT_NOT_YOURS);
        }
        
        comment.updateContent(request.content());
        return CommentResponse.of(commentRepository.save(comment));
    }
    
    public void deleteComment(UserToken userToken, Long commentId) {
        Long userId = userToken.userId();
        
        HighlightComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new NotFoundException(ErrorCode.COMMENT_NOT_FOUND));
        
        if (!comment.getAuthor().getId().equals(userId)) {
            throw new ForbiddenException(ErrorCode.COMMENT_NOT_YOURS);
        }
        
        commentRepository.delete(comment);
    }
} 