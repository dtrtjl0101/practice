package qwerty.chaekit.controller.member.user;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import qwerty.chaekit.dto.group.activity.ActivityFetchResponse;
import qwerty.chaekit.dto.group.response.GroupFetchResponse;
import qwerty.chaekit.dto.highlight.HighlightFetchResponse;
import qwerty.chaekit.dto.member.LoginResponse;
import qwerty.chaekit.dto.member.UserInfoResponse;
import qwerty.chaekit.dto.member.UserJoinRequest;
import qwerty.chaekit.dto.page.PageResponse;
import qwerty.chaekit.global.response.ApiSuccessResponse;
import qwerty.chaekit.global.security.resolver.Login;
import qwerty.chaekit.global.security.resolver.UserToken;
import qwerty.chaekit.service.group.ActivityService;
import qwerty.chaekit.service.group.DiscussionService;
import qwerty.chaekit.service.group.GroupService;
import qwerty.chaekit.service.highlight.HighlightService;
import qwerty.chaekit.service.member.user.UserJoinService;
import qwerty.chaekit.service.member.user.UserService;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Slf4j
public class UserController {
    private final UserJoinService joinService;
    private final UserService userService;
    private final HighlightService highlightService;
    private final ActivityService activityService;
    private final GroupService groupService;

    @Operation(
            summary = "회원가입",
            description = "회원가입을 진행합니다."
    )
    @PostMapping(path = "/join", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiSuccessResponse<LoginResponse> userJoin(@ModelAttribute @Valid UserJoinRequest joinRequest) {
        return ApiSuccessResponse.of(joinService.join(joinRequest));
    }

    @Operation(
            summary = "내 계정 정보 조회",
            description = "내 계정 정보를 조회합니다."
    )
    @GetMapping("/me")
    public ApiSuccessResponse<UserInfoResponse> userInfo(@Login UserToken userToken) {
        return ApiSuccessResponse.of(userService.getUserProfile(userToken));
    }

    @Operation(
            summary = "내 하이라이트 조회",
            description = "내가 작성한 하이라이트를 조회합니다."
    )
    @GetMapping("/me/highlights")
    public ApiSuccessResponse<PageResponse<HighlightFetchResponse>> getMyHighlights(
            @Login UserToken userToken,
            @ParameterObject Pageable pageable,
            @RequestParam(required = false) Long bookId
    ) {
        return ApiSuccessResponse.of(highlightService.getMyHighlights(userToken, bookId, pageable));
    }

    @Operation(
            summary = "내 활동 조회",
            description = "내가 가입한 모든 활동을 조회합니다."
    )
    @GetMapping("/me/activities")
    public ApiSuccessResponse<PageResponse<ActivityFetchResponse>> getMyActivities(
            @Parameter(hidden = true) @Login UserToken userToken,
            @RequestParam(required = false) Long bookId,
            Pageable pageable
    ) {
        return ApiSuccessResponse.of(activityService.getMyActivities(userToken, bookId, pageable));
    }

    @Operation(
            summary = "내 모임 조회",
            description = "내가 가입한 모든 모임을 조회합니다."
    )
    @GetMapping("/me/groups")
    public ApiSuccessResponse<PageResponse<GroupFetchResponse>> getMyGroups(
            @Parameter(hidden = true) @Login UserToken userToken,
            Pageable pageable
    ) {
        return ApiSuccessResponse.of(groupService.getJoinedGroups(userToken, pageable));
    }
}
