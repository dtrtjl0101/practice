package qwerty.chaekit.controller.highlight.comment;

import io.swagger.v3.oas.annotations.Operation;
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
    
    @Operation(
            summary = "하이라이트 댓글 생성",
            description = "특정 하이라이트에 댓글을 작성합니다. "
    )
    @PostMapping("/{highlightId}/comments")
    public ApiSuccessResponse<HighlightCommentResponse> createComment(
            @Login UserToken userToken,
            @PathVariable Long highlightId,
            @RequestBody HighlightCommentRequest request) {
        return ApiSuccessResponse.of(highlightCommentService.createComment(userToken, highlightId, request));
    }
    
    @Operation(
            summary = "하이라이트 댓글 조회",
            description = "특정 하이라이트에 작성된 댓글들을 조회합니다."
    )
    @GetMapping("/{highlightId}/comments")
    public ApiSuccessResponse<List<HighlightCommentResponse>> getComments(
            @Login UserToken userToken,
            @PathVariable Long highlightId) {
        return ApiSuccessResponse.of(highlightCommentService.getComments(userToken, highlightId));
    }
    
    @Operation(
            summary = "하이라이트 댓글 수정",
            description = "특정 하이라이트 댓글을 수정합니다."
    )
    @PatchMapping("/comments/{commentId}")
    public ApiSuccessResponse<HighlightCommentResponse> updateComment(
            @Login UserToken userToken,
            @PathVariable Long commentId,
            @RequestBody HighlightCommentRequest request) {
        return ApiSuccessResponse.of(highlightCommentService.updateComment(userToken, commentId, request));
    }
    
    @Operation(
            summary = "하이라이트 댓글 삭제",
            description = "특정 하이라이트 댓글을 삭제합니다."
    )
    @DeleteMapping("/comments/{commentId}")
    public ApiSuccessResponse<String> deleteComment(
            @Login UserToken userToken,
            @PathVariable Long commentId) {
        highlightCommentService.deleteComment(userToken, commentId);
        return ApiSuccessResponse.of("댓글이 삭제되었습니다.");
    }
} 