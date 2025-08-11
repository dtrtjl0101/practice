package qwerty.chaekit.controller.ebook;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;
import qwerty.chaekit.dto.ebook.purchase.ReadingProgressRequest;
import qwerty.chaekit.dto.ebook.purchase.ReadingProgressResponse;
import qwerty.chaekit.dto.page.PageResponse;
import qwerty.chaekit.dto.statistics.ReadingProgressHistoryResponse;
import qwerty.chaekit.global.response.ApiSuccessResponse;
import qwerty.chaekit.global.security.resolver.Login;
import qwerty.chaekit.global.security.resolver.UserToken;
import qwerty.chaekit.service.ebook.ReadingProgressService;
import qwerty.chaekit.service.statistics.ReadingProgressHistoryService;

import java.util.List;


@RestController
@RequiredArgsConstructor
@RequestMapping("/api/reading-progress")
public class ReadingProgressController {
    private final ReadingProgressService readingProgressService;
    private final ReadingProgressHistoryService readingProgressHistoryService;

    @Operation(
            summary = "내 독서 진행률 저장",
            description = "특정 책에 대한 나의 독서 진행률을 저장합니다. " +
                    "진행률은 0에서 100 사이의 값으로, 100은 책을 다 읽었음을 의미합니다."
    )
    @PostMapping("/{bookId}/save")
    public ApiSuccessResponse<Void> saveMyProgress(
            @Parameter(hidden = true) @Login UserToken userToken,
            @PathVariable Long bookId,
            @RequestBody ReadingProgressRequest request
    ) {
        readingProgressService.saveMyProgress(userToken, bookId, request);
        return ApiSuccessResponse.emptyResponse();
    }

    @Operation(
            summary = "내 독서 진행률 조회",
            description = "특정 책에 대한 나의 독서 진행률을 조회합니다. "
    )
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

    @Operation(
            summary = "독서 진행률 히스토리 조회",
            description = "특정 독서모임 활동에 대한 모든 모임원의 독서 진행률 히스토리를 조회합니다. " +
                    "이 API는 사용자의 독서 진행률 변화를 시간순으로 보여줍니다."
    )
    @GetMapping("/activities/{activityId}/history")
    public ApiSuccessResponse<List<ReadingProgressHistoryResponse>> getProgressHistory(
            @Parameter(hidden = true) @Login UserToken userToken,
            @PathVariable Long activityId
    ) {
        return ApiSuccessResponse.of(readingProgressHistoryService.getHistory(userToken, activityId));
    }
}