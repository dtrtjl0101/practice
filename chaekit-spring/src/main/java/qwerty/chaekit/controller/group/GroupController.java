package qwerty.chaekit.controller.group;

import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;
import qwerty.chaekit.dto.group.*;
import qwerty.chaekit.global.response.ApiSuccessResponse;
import qwerty.chaekit.global.security.resolver.Login;
import qwerty.chaekit.global.security.resolver.LoginMember;
import qwerty.chaekit.service.GroupService;

@RestController
@RequestMapping("/api/groups")
@RequiredArgsConstructor
public class GroupController {
    private final GroupService groupService;

    @PostMapping
    public ApiSuccessResponse<GroupPostResponse> createGroup(@Login LoginMember loginMember,
                                         @RequestBody GroupPostRequest groupPostRequest) {
        return ApiSuccessResponse.of(groupService.createGroup(loginMember, groupPostRequest));
    }

    @GetMapping
    public ApiSuccessResponse<GroupListResponse> getAllGroups(@ParameterObject Pageable pageable) {
        return ApiSuccessResponse.of(groupService.fetchGroupList(pageable));
    }

    @GetMapping("/{groupId}/info")
    public ApiSuccessResponse<GroupFetchResponse> getGroup(@PathVariable long groupId) {
        return ApiSuccessResponse.of(groupService.fetchGroup(groupId));
    }

    @PutMapping("/{groupId}")
    public ApiSuccessResponse<GroupPostResponse> updateGroup(@Login LoginMember loginMember,
                                         @PathVariable long groupId,
                                         @RequestBody GroupPutRequest request) {
        return ApiSuccessResponse.of(groupService.updateGroup(loginMember, groupId, request));
    }


}
