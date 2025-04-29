package qwerty.chaekit.controller.group;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
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
                                         @ModelAttribute @Valid GroupPostRequest groupPostRequest) {
        return ApiSuccessResponse.of(groupService.createGroup(userToken, groupPostRequest));
    }

    @GetMapping
    public ApiSuccessResponse<PageResponse<GroupFetchResponse>> getAllGroups(
            @Login(required = false) UserToken userToken,
            @ParameterObject Pageable pageable) {
        return ApiSuccessResponse.of(groupService.fetchAllGroupList(userToken, pageable));
    }

    @GetMapping("/{groupId}/info")
    public ApiSuccessResponse<GroupFetchResponse> getGroup(
            @Login(required = false) UserToken userToken,
            @PathVariable long groupId) {
        return ApiSuccessResponse.of(groupService.fetchGroup(userToken, groupId));
    }

    @PatchMapping("/{groupId}")
    public ApiSuccessResponse<GroupPostResponse> updateGroup(@Login UserToken userToken,
                                         @PathVariable long groupId,
                                         @ModelAttribute @Valid GroupPutRequest request) {
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

    @PatchMapping("/{groupId}/members/{userId}/reject")
    public ApiSuccessResponse<Void> rejectJoinRequest(
            @Login UserToken userToken,
            @PathVariable long groupId,
            @PathVariable long userId) {
        groupService.rejectJoinRequest(userToken, groupId, userId);
        return ApiSuccessResponse.emptyResponse();
    }

    @DeleteMapping("/{groupId}/members/leave")
    public ApiSuccessResponse<Void> leaveGroup(
            @Login UserToken userToken,
            @PathVariable long groupId) {
        groupService.leaveGroup(userToken, groupId);
        return ApiSuccessResponse.emptyResponse();
    }

    @GetMapping("/{groupId}/members/pending")
    public ApiSuccessResponse<PageResponse<GroupPendingMemberResponse>> getPendingList(
            @Login UserToken userToken,
            @ParameterObject Pageable pageable,
            @PathVariable long groupId
    ) {
        return ApiSuccessResponse.of(groupService.fetchPendingList(pageable, userToken, groupId));
    }
}
