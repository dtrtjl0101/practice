package qwerty.chaekit.controller.highlight;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;
import qwerty.chaekit.dto.highlight.HighlightFetchResponse;
import qwerty.chaekit.dto.highlight.HighlightPostRequest;
import qwerty.chaekit.dto.highlight.HighlightPostResponse;
import qwerty.chaekit.dto.highlight.HighlightPutRequest;
import qwerty.chaekit.dto.highlight.reaction.HighlightReactionResponse;
import qwerty.chaekit.dto.page.PageResponse;
import qwerty.chaekit.global.response.ApiSuccessResponse;
import qwerty.chaekit.global.security.resolver.Login;
import qwerty.chaekit.global.security.resolver.UserToken;
import qwerty.chaekit.service.highlight.HighlightService;
import qwerty.chaekit.service.highlight.reaction.HighlightReactionService;

import java.util.List;

@RestController
@RequestMapping("/api/highlights")
@RequiredArgsConstructor
public class HighlightController {
    private final HighlightService highlightService;
    private final HighlightReactionService highlightReactionService;

    @Operation(
            summary = "하이라이트 조회",
            description = "하이라이트를 조회합니다. " +
                    "필터링 옵션으로 활동 ID, 도서 ID, 스파인, 나의 하이라이트 여부, 키워드를 사용할 수 있습니다."
    )
    @GetMapping
    public ApiSuccessResponse<PageResponse<HighlightFetchResponse>> getHighlights(@Login UserToken userToken,
                                                                                  @ParameterObject Pageable pageable,
                                                                                  @RequestParam(required = false) Long activityId,
                                                                                  @RequestParam(required = false) Long bookId,
                                                                                  @RequestParam(required = false) String spine,
                                                                                  @RequestParam boolean me,
                                                                                  @RequestParam(required = false) String keyword
    ) {
        return ApiSuccessResponse.of(highlightService.fetchHighlights(userToken, pageable, activityId, bookId, spine, me, keyword));
    }

    @Operation(
            summary = "하이라이트 상세 조회",
            description = "특정 하이라이트의 상세 정보를 조회합니다."
    )
    @GetMapping("/{id}")
    public ApiSuccessResponse<HighlightFetchResponse> getHighlight(@Login UserToken userToken, @PathVariable Long id) {
        return ApiSuccessResponse.of(highlightService.fetchHighlight(userToken, id));
    }

    @Operation(
            summary = "하이라이트 생성",
            description = "새로운 하이라이트를 생성합니다. " +
                    "활동 ID, 도서 ID, spine, cfi, 메모 내용, 인용 구절 등을 포함할 수 있습니다."
    )
    @PostMapping
    public ApiSuccessResponse<HighlightPostResponse> createHighlight(@Login UserToken userToken, @RequestBody @Valid HighlightPostRequest request) {
        return ApiSuccessResponse.of(highlightService.createHighlight(userToken, request));
    }
    
    @Operation(
            summary = "하이라이트 수정",
            description = "특정 하이라이트를 수정합니다."
    )
    @PatchMapping("/{id}")
    public ApiSuccessResponse<HighlightPostResponse> updateHighlight(@Login UserToken userToken, @PathVariable Long id, @RequestBody HighlightPutRequest request) {
        return ApiSuccessResponse.of(highlightService.updateHighlight(userToken, id, request));
    }

    @Operation(
            summary = "하이라이트 반응 추가",
            description = "특정 하이라이트에 대한 반응을 추가합니다."
    )
    @GetMapping("/{highlightId}/reactions")
    public ApiSuccessResponse<List<HighlightReactionResponse>> getHighlightReactions(
            @Parameter(hidden = true) @Login UserToken userToken,
            @PathVariable Long highlightId
    ) {
        return ApiSuccessResponse.of(highlightReactionService.getHighlightReactions(userToken, highlightId));
    }

    @DeleteMapping("/{id}")
    @Operation(
            summary = "하이라이트 삭제",
            description = "특정 하이라이트를 삭제합니다."
    )
    public ApiSuccessResponse<String> deleteHighlight(@Login UserToken userToken, @PathVariable Long id) {
        highlightService.deleteHighlight(userToken, id);
        return ApiSuccessResponse.of("하이라이트가 성공적으로 삭제되었습니다.");
    }
}
