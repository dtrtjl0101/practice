package qwerty.chaekit.controller.highlight.reaction;

import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import qwerty.chaekit.dto.highlight.reaction.HighlightReactionRequest;
import qwerty.chaekit.dto.highlight.reaction.HighlightReactionResponse;
import qwerty.chaekit.global.response.ApiSuccessResponse;
import qwerty.chaekit.global.security.resolver.Login;
import qwerty.chaekit.global.security.resolver.UserToken;
import qwerty.chaekit.service.highlight.reaction.HighlightReactionService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/highlights")
public class HighlightReactionController {
    private final HighlightReactionService highlightReactionService;
    
    @Operation(
            summary = "하이라이트 이모티콘 추가",
            description = "특정 하이라이트에 이모티콘을 추가합니다. " +
                    "이모티콘은 사용자의 감정을 표현하는데 사용됩니다."
    )
    @PostMapping("/{highlightId}/reactions")
    public ApiSuccessResponse<HighlightReactionResponse> addReaction(
            @Login UserToken userToken,
            @PathVariable Long highlightId,
            @RequestBody HighlightReactionRequest request) {
        return ApiSuccessResponse.of(highlightReactionService.addReaction(userToken, highlightId, request));
    }

    @Operation(
            summary = "하이라이트 이모티콘 조회",
            description = "특정 하이라이트에 추가된 이모티콘들을 조회합니다."
    )
    @DeleteMapping("/reactions/{reactionId}")
    public ApiSuccessResponse<String> deleteReaction(
            @Login UserToken userToken,
            @PathVariable Long reactionId) {
        highlightReactionService.deleteReaction(userToken, reactionId);
        return ApiSuccessResponse.of("이모티콘을 삭제했습니다.");
    }
} 