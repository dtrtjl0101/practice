package qwerty.chaekit.controller.group;

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
@RequestMapping("/api/groups/{groupId}/activities")
@RequiredArgsConstructor
public class ActivityController {
    private final ActivityService activityService;

    @PostMapping
    public ApiSuccessResponse<ActivityPostResponse> createActivity(@Login UserToken userToken,
                                                                   @PathVariable long groupId,
                                                                   @RequestBody @Valid ActivityPostRequest activityPostRequest) {
        return ApiSuccessResponse.of(activityService.createActivity(userToken, groupId, activityPostRequest));
    }

    @GetMapping
    public ApiSuccessResponse<PageResponse<ActivityFetchResponse>> getAllActivities(@ParameterObject Pageable pageable,
                                                                                    @PathVariable long groupId) {
        return ApiSuccessResponse.of(activityService.fetchAllActivities(pageable, groupId));
    }

    @GetMapping("/{activityId}")
    public ApiSuccessResponse<ActivityFetchResponse> getActivity(@PathVariable long groupId,
                                                               @PathVariable long activityId) {
        return ApiSuccessResponse.of(activityService.fetchActivity(groupId, activityId));
    }

    @PatchMapping
    public ApiSuccessResponse<ActivityPostResponse> updateActivity(@Login UserToken userToken,
                                         @PathVariable long groupId,
                                         @RequestBody @Valid ActivityPatchRequest request) {
        return ApiSuccessResponse.of(activityService.updateActivity(userToken, groupId, request));
    }

    //

}
