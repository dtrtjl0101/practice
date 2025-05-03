package qwerty.chaekit.controller.highlight.comment;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import qwerty.chaekit.dto.highlight.comment.CommentRequest;
import qwerty.chaekit.dto.highlight.comment.CommentResponse;
import qwerty.chaekit.global.response.ApiSuccessResponse;
import qwerty.chaekit.global.security.resolver.Login;
import qwerty.chaekit.global.security.resolver.UserToken;
import qwerty.chaekit.service.highlight.comment.CommentService;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/highlights")
public class CommentController {
    private final CommentService commentService;
    
    @PostMapping("/{highlightId}/comments")
    public ApiSuccessResponse<CommentResponse> createComment(
            @Login UserToken userToken,
            @PathVariable Long highlightId,
            @RequestBody CommentRequest request) {
        return ApiSuccessResponse.of(commentService.createComment(userToken, highlightId, request));
    }
    
    @GetMapping("/{highlightId}/comments")
    public ApiSuccessResponse<List<CommentResponse>> getComments(
            @PathVariable Long highlightId) {
        return ApiSuccessResponse.of(commentService.getComments(highlightId));
    }
    
    @PatchMapping("/comments/{commentId}")
    public ApiSuccessResponse<CommentResponse> updateComment(
            @Login UserToken userToken,
            @PathVariable Long commentId,
            @RequestBody CommentRequest request) {
        return ApiSuccessResponse.of(commentService.updateComment(userToken, commentId, request));
    }
    
    @DeleteMapping("/comments/{commentId}")
    public ApiSuccessResponse<String> deleteComment(
            @Login UserToken userToken,
            @PathVariable Long commentId) {
        commentService.deleteComment(userToken, commentId);
        return ApiSuccessResponse.of("comment가 삭제되었습니다.");
    }
} 