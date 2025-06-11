package qwerty.chaekit.controller.group;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;
import qwerty.chaekit.dto.group.activity.*;
import qwerty.chaekit.dto.highlight.HighlightPreviewResponse;
import qwerty.chaekit.dto.page.PageResponse;
import qwerty.chaekit.global.response.ApiSuccessResponse;
import qwerty.chaekit.global.security.resolver.Login;
import qwerty.chaekit.global.security.resolver.UserToken;
import qwerty.chaekit.service.group.ActivityService;
import qwerty.chaekit.service.highlight.HighlightService;

import java.util.List;

@RestController
@RequestMapping
@RequiredArgsConstructor
public class ActivityController {
    private final ActivityService activityService;
    private final HighlightService highlightService;

    @PostMapping("/api/groups/{groupId}/activities")
    public ApiSuccessResponse<ActivityPostResponse> createActivity(@Login UserToken userToken,
                                                                   @PathVariable long groupId,
                                                                   @RequestBody @Valid ActivityPostRequest activityPostRequest) {
        return ApiSuccessResponse.of(activityService.createActivity(userToken, groupId, activityPostRequest));
    }

    @GetMapping("/api/groups/{groupId}/activities")
    public ApiSuccessResponse<PageResponse<ActivityFetchResponse>> getAllActivities(
            @Parameter(hidden = true) @Login(required = false) UserToken userToken,
            @ParameterObject Pageable pageable,
            @PathVariable long groupId
    ) {
        return ApiSuccessResponse.of(activityService.fetchAllActivities(userToken, pageable, groupId));
    }

    @GetMapping("/api/activities/{activityId}")
    public ApiSuccessResponse<ActivityFetchResponse> getActivity(
            @Parameter(hidden = true) @Login UserToken userToken,
            @PathVariable long activityId) {
        return ApiSuccessResponse.of(activityService.fetchActivity(userToken, activityId));
    }

    @PatchMapping("/api/groups/{groupId}/activities")
    public ApiSuccessResponse<ActivityPostResponse> updateActivity(@Login UserToken userToken,
                                         @PathVariable long groupId,
                                         @RequestBody @Valid ActivityPatchRequest request) {
        return ApiSuccessResponse.of(activityService.updateActivity(userToken, groupId, request));
    }

    @Operation(
            summary = "모임 활동 가입",
            description = "모임 활동에 가입합니다."
    )
    @PostMapping("/api/activities/{activityId}/join")
    public ApiSuccessResponse<Void> joinActivity(
            @Login UserToken userToken,
            @PathVariable long activityId
    ) {
        activityService.joinActivity(userToken, activityId);
        return ApiSuccessResponse.emptyResponse();
    }

    @Operation(
            summary = "모임 활동 탈퇴",
            description = "모임 활동에서 탈퇴합니다."
    )
    @PostMapping("/api/activities/{activityId}/leave")
    public ApiSuccessResponse<Void> leaveActivity(
            @Login UserToken userToken,
            @PathVariable long activityId
    ) {
        activityService.leaveActivity(userToken, activityId);
        return ApiSuccessResponse.emptyResponse();
    }

    @Operation(
            summary = "상위 5명의 활동 점수 조회",
            description = "활동에 참여한 유저들의 활동 점수를 조회합니다. " +
                    "점수는 하이라이트, 하이라이트 댓글, 토론, 토론 댓글의 개수에 따라 계산됩니다. " +
                    "하이라이트는 3점, 하이라이트 댓글은 1점, 토론은 5점, 토론 댓글은 2점입니다."
    )
    @GetMapping("/api/activities/{activityId}/scores")
    public ApiSuccessResponse<List<ActivityScoreResponse>> getActivityTop5Scores(
            @PathVariable long activityId
    ) {
        return ApiSuccessResponse.of(activityService.getActivityTop5Scores(activityId));
    }

    @Operation(
            summary = "최근 메모 조회",
            description = "특정 활동에 등록된 최신 하이라이트 5개를 조회합니다."
    )
    @GetMapping("/api/activities/{activityId}/highlights/recent")
    public ApiSuccessResponse<List<HighlightPreviewResponse>> getRecentHighlights(
            @PathVariable long activityId
    ) {
        return ApiSuccessResponse.of(highlightService.getActivityRecentHighlights(activityId));
    }
}
