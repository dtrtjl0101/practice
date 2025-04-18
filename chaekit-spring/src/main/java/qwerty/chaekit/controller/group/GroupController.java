package qwerty.chaekit.controller.group;

import lombok.RequiredArgsConstructor;
import org.apache.catalina.User;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;
import qwerty.chaekit.dto.group.*;
import qwerty.chaekit.dto.page.PageResponse;
import qwerty.chaekit.global.response.ApiSuccessResponse;
import qwerty.chaekit.global.security.resolver.Login;
import qwerty.chaekit.global.security.resolver.UserToken;
import qwerty.chaekit.service.group.GroupService;

@RestController
@RequestMapping("/api/groups")
@RequiredArgsConstructor
public class GroupController {
    private final GroupService groupService;

    @PostMapping
    public ApiSuccessResponse<GroupPostResponse> createGroup(@Login UserToken userToken,
                                         @RequestBody GroupPostRequest groupPostRequest) {
        return ApiSuccessResponse.of(groupService.createGroup(userToken, groupPostRequest));
    }

    @GetMapping
    public ApiSuccessResponse<PageResponse<GroupFetchResponse>> getAllGroups(@ParameterObject Pageable pageable) {
        return ApiSuccessResponse.of(groupService.fetchGroupList(pageable));
    }

    @GetMapping("/{groupId}/info")
    public ApiSuccessResponse<GroupFetchResponse> getGroup(@PathVariable long groupId) {
        return ApiSuccessResponse.of(groupService.fetchGroup(groupId));
    }

    @PutMapping("/{groupId}")
    public ApiSuccessResponse<GroupPostResponse> updateGroup(@Login UserToken userToken,
                                         @PathVariable long groupId,
                                         @RequestBody GroupPutRequest request) {
        return ApiSuccessResponse.of(groupService.updateGroup(userToken, groupId, request));
    }

    @PostMapping("/{groupId}/join")
    public ApiSuccessResponse<GroupJoinResponse> requestJoinGroup(
            @Login UserToken userToken,
            @PathVariable long groupId) {
        return ApiSuccessResponse.of(groupService.requestJoinGroup(userToken, groupId));
    }

    @PatchMapping("/{groupId}/members/{userId}/approve")
    public ApiSuccessResponse<GroupJoinResponse> approveJoinRequest(
            @Login UserToken userToken,
            @PathVariable long groupId,
            @PathVariable long userId) {
        return ApiSuccessResponse.of(groupService.approveJoinRequest(userToken, groupId, userId));
    }


}
