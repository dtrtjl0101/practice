package qwerty.chaekit.controller.highlight.comment;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import qwerty.chaekit.dto.highlight.comment.HighlightCommentRequest;
import qwerty.chaekit.dto.highlight.comment.HighlightCommentResponse;
import qwerty.chaekit.global.response.ApiSuccessResponse;
import qwerty.chaekit.global.security.resolver.Login;
import qwerty.chaekit.global.security.resolver.UserToken;
import qwerty.chaekit.service.highlight.comment.HighlightCommentService;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/highlights")
public class HighlightCommentController {
    private final HighlightCommentService highlightCommentService;
    
    @PostMapping("/{highlightId}/comments")
    public ApiSuccessResponse<HighlightCommentResponse> createComment(
            @Login UserToken userToken,
            @PathVariable Long highlightId,
            @RequestBody HighlightCommentRequest request) {
        return ApiSuccessResponse.of(highlightCommentService.createComment(userToken, highlightId, request));
    }
    
    @GetMapping("/{highlightId}/comments")
    public ApiSuccessResponse<List<HighlightCommentResponse>> getComments(
            @Login UserToken userToken,
            @PathVariable Long highlightId) {
        return ApiSuccessResponse.of(highlightCommentService.getComments(userToken, highlightId));
    }
    
    @PatchMapping("/comments/{commentId}")
    public ApiSuccessResponse<HighlightCommentResponse> updateComment(
            @Login UserToken userToken,
            @PathVariable Long commentId,
            @RequestBody HighlightCommentRequest request) {
        return ApiSuccessResponse.of(highlightCommentService.updateComment(userToken, commentId, request));
    }
    
    @DeleteMapping("/comments/{commentId}")
    public ApiSuccessResponse<String> deleteComment(
            @Login UserToken userToken,
            @PathVariable Long commentId) {
        highlightCommentService.deleteComment(userToken, commentId);
        return ApiSuccessResponse.of("댓글이 삭제되었습니다.");
    }
} 