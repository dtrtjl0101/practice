package qwerty.chaekit.controller.highlight;

import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;
import qwerty.chaekit.dto.highlight.*;
import qwerty.chaekit.dto.highlight.comment.CommentResponse;
import qwerty.chaekit.dto.page.PageResponse;
import qwerty.chaekit.global.response.ApiSuccessResponse;
import qwerty.chaekit.global.security.resolver.Login;
import qwerty.chaekit.global.security.resolver.UserToken;
import qwerty.chaekit.service.highlight.HighlightService;
import qwerty.chaekit.dto.highlight.reaction.ReactionResponse;

import java.util.List;

@RestController
@RequestMapping("/api/highlights")
@RequiredArgsConstructor
public class HighlightController {
    private final HighlightService highlightService;

    @GetMapping
    public ApiSuccessResponse<PageResponse<HighlightFetchResponse>> getHighlights(@Login UserToken userToken,
                                                                                  @ParameterObject Pageable pageable,
                                                                                  @RequestParam(required = false) Long activityId,
                                                                                  @RequestParam(required = false) Long bookId,
                                                                                  @RequestParam(required = false) String spine,
                                                                                  @RequestParam(required = false) Boolean me
    ) {
        return ApiSuccessResponse.of(highlightService.fetchHighlights(userToken, pageable, activityId, bookId, spine, me));
    }

    @PostMapping
    public ApiSuccessResponse<HighlightPostResponse> createHighlight(@Login UserToken userToken, @RequestBody HighlightPostRequest request) {
        return ApiSuccessResponse.of(highlightService.createHighlight(userToken, request));
    }

    @PatchMapping("/{id}")
    public ApiSuccessResponse<HighlightPostResponse> updateHighlight(@Login UserToken userToken, @PathVariable Long id, @RequestBody HighlightPutRequest request) {
        return ApiSuccessResponse.of(highlightService.updateHighlight(userToken, id, request));
    }

    @GetMapping("/{highlightId}/reactions")
    public ApiSuccessResponse<List<ReactionResponse>> getHighlightReactions(
            @PathVariable Long highlightId) {
        return ApiSuccessResponse.of(highlightService.getHighlightReactions(highlightId));
    }

    @DeleteMapping("/{id}")
    public ApiSuccessResponse<String> deleteHighlight(@Login UserToken userToken, @PathVariable Long id) {
        highlightService.deleteHighlight(userToken, id);
        return ApiSuccessResponse.of("하이라이트가 성공적으로 삭제되었습니다.");
    }
}
