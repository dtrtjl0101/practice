package qwerty.chaekit.controller.highlight.reaction;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import qwerty.chaekit.dto.highlight.reaction.ReactionRequest;
import qwerty.chaekit.dto.highlight.reaction.ReactionResponse;
import qwerty.chaekit.global.response.ApiSuccessResponse;
import qwerty.chaekit.global.security.resolver.Login;
import qwerty.chaekit.global.security.resolver.UserToken;
import qwerty.chaekit.service.highlight.reaction.ReactionService;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/highlights")
public class ReactionController {
    private final ReactionService reactionService;
    
    @PostMapping("/{highlightId}/reactions")
    public ApiSuccessResponse<ReactionResponse> addReaction(
            @Login UserToken userToken,
            @PathVariable Long highlightId,
            @RequestBody ReactionRequest request) {
        return ApiSuccessResponse.of(reactionService.addReaction(userToken, highlightId, request));
    }

    @DeleteMapping("/reactions/{reactionId}")
    public ApiSuccessResponse<String> deleteReaction(
            @Login UserToken userToken,
            @PathVariable Long reactionId) {
        reactionService.deleteReaction(userToken, reactionId);
        return ApiSuccessResponse.of("이모티콘을 삭제했습니다.");
    }
} 