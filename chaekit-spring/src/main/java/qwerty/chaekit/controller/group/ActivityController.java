package qwerty.chaekit.controller.group;

import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;
import qwerty.chaekit.dto.group.activity.ActivityFetchResponse;
import qwerty.chaekit.dto.group.activity.ActivityPatchRequest;
import qwerty.chaekit.dto.group.activity.ActivityPostRequest;
import qwerty.chaekit.dto.group.activity.ActivityPostResponse;
import qwerty.chaekit.dto.page.PageResponse;
import qwerty.chaekit.global.response.ApiSuccessResponse;
import qwerty.chaekit.global.security.resolver.Login;
import qwerty.chaekit.global.security.resolver.UserToken;
import qwerty.chaekit.service.group.ActivityService;

@RestController
@RequestMapping
@RequiredArgsConstructor
public class ActivityController {
    private final ActivityService activityService;

    @PostMapping("/api/groups/{groupId}/activities")
    public ApiSuccessResponse<ActivityPostResponse> createActivity(@Login UserToken userToken,
                                                                   @PathVariable long groupId,
                                                                   @RequestBody @Valid ActivityPostRequest activityPostRequest) {
        return ApiSuccessResponse.of(activityService.createActivity(userToken, groupId, activityPostRequest));
    }

    @GetMapping("/api/groups/{groupId}/activities")
    public ApiSuccessResponse<PageResponse<ActivityFetchResponse>> getAllActivities(@ParameterObject Pageable pageable,
                                                                                    @PathVariable long groupId) {
        return ApiSuccessResponse.of(activityService.fetchAllActivities(pageable, groupId));
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

}
