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
import qwerty.chaekit.global.security.resolver.LoginMember;
import qwerty.chaekit.service.group.ActivityService;

@RestController
@RequestMapping("/api/groups/{groupId}/activities")
@RequiredArgsConstructor
public class ActivityController {
    private final ActivityService activityService;

    @PostMapping
    public ApiSuccessResponse<ActivityPostResponse> createActivity(@Login LoginMember loginMember,
                                                                   @PathVariable long groupId,
                                                                   @RequestBody @Valid ActivityPostRequest activityPostRequest) {
        return ApiSuccessResponse.of(activityService.createActivity(loginMember, groupId, activityPostRequest));
    }

    @GetMapping
    public ApiSuccessResponse<PageResponse<ActivityFetchResponse>> getAllActivities(@ParameterObject Pageable pageable,
                                                                                    @PathVariable long groupId) {
        return ApiSuccessResponse.of(activityService.fetchAllActivities(pageable, groupId));
    }

    @PatchMapping("/{activityId}")
    public ApiSuccessResponse<ActivityPostResponse> updateActivity(@Login LoginMember loginMember,
                                         @PathVariable long groupId,
                                         @RequestBody ActivityPatchRequest request) {
        return ApiSuccessResponse.of(activityService.updateActivity(loginMember, groupId, request));
    }


}
