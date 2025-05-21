package qwerty.chaekit.controller.ebook;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;
import qwerty.chaekit.dto.ebook.purchase.ReadingProgressRequest;
import qwerty.chaekit.dto.ebook.purchase.ReadingProgressResponse;
import qwerty.chaekit.dto.page.PageResponse;
import qwerty.chaekit.global.response.ApiSuccessResponse;
import qwerty.chaekit.global.security.resolver.Login;
import qwerty.chaekit.global.security.resolver.UserToken;
import qwerty.chaekit.service.ebook.ReadingProgressService;



@RestController
@RequiredArgsConstructor
@RequestMapping("/api/reading-progress")
public class ReadingProgressController {

    private final ReadingProgressService readingProgressService;

    @PostMapping("/{bookId}/save")
    public ApiSuccessResponse<Void> saveMyProgress(
            @Parameter(hidden = true) @Login UserToken userToken,
            @PathVariable Long bookId,
            @RequestBody ReadingProgressRequest request
    ) {
        readingProgressService.saveMyProgress(userToken, bookId, request);
        return ApiSuccessResponse.emptyResponse();
    }

    @GetMapping("/{bookId}")
    public ApiSuccessResponse<ReadingProgressResponse> getMyProgress(
            @Parameter(hidden = true) @Login UserToken userToken,
            @PathVariable Long bookId
    ) {
        return ApiSuccessResponse.of(readingProgressService.getMyProgress(userToken, bookId));
    }

    @Operation(
            summary = "모든 활동 멤버의 독서 진행률 조회",
            description = "특정 독서모임 활동에 속하는 모든 사용자의 진행률 정보를 가져옵니다"
    )
    @GetMapping("/activities/{activityId}")
    public ApiSuccessResponse<PageResponse<ReadingProgressResponse>> getProgressFromActivity(
            @PathVariable Long activityId,
            Pageable pageable
    ) {
        return ApiSuccessResponse.of(readingProgressService.getProgressFromActivity(activityId, pageable));
    }
}