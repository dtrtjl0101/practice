package qwerty.chaekit.controller.group;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import qwerty.chaekit.dto.group.request.GroupPatchRequest;
import qwerty.chaekit.dto.group.request.GroupPostRequest;
import qwerty.chaekit.dto.group.request.GroupSortType;
import qwerty.chaekit.dto.group.response.GroupFetchResponse;
import qwerty.chaekit.dto.group.response.GroupJoinResponse;
import qwerty.chaekit.dto.group.response.GroupMemberResponse;
import qwerty.chaekit.dto.group.response.GroupPostResponse;
import qwerty.chaekit.dto.page.PageResponse;
import qwerty.chaekit.global.response.ApiSuccessResponse;
import qwerty.chaekit.global.security.resolver.Login;
import qwerty.chaekit.global.security.resolver.UserToken;
import qwerty.chaekit.service.group.GroupMemberService;
import qwerty.chaekit.service.group.GroupService;

import java.util.List;

@RestController
@RequestMapping("/api/groups")
@RequiredArgsConstructor
public class GroupController {
    private final GroupService groupService;
    private final GroupMemberService groupMemberService;

    @Operation(
            summary = "모임 생성",
            description = "새로운 모임을 생성합니다."
    )
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiSuccessResponse<GroupPostResponse> createGroup(
            @Parameter(hidden = true) @Login UserToken userToken,
            @ModelAttribute @Valid GroupPostRequest groupPostRequest
    ) {
        return ApiSuccessResponse.of(groupService.createGroup(userToken, groupPostRequest));
    }

    @Operation(
            summary = "모임 목록 조회",
            description = "모임 목록을 조회합니다. 태그로 필터링할 수 있습니다. " +
                    "정렬 기준은 MEMBER_COUNT(가입자 수), CREATED_AT(최신 생성 순) 중 선택할 수 있습니다."
    )
    @GetMapping
    public ApiSuccessResponse<PageResponse<GroupFetchResponse>> getAllGroups(
            @Parameter(hidden = true) @Login(required = false) UserToken userToken,
            @ParameterObject Pageable pageable,
            @RequestParam(required = false) List<String> tags,
            @RequestParam(required = false, defaultValue = "MEMBER_COUNT") GroupSortType sortBy
    ) {
        return ApiSuccessResponse.of(groupService.getAllGroups(userToken, pageable, tags, sortBy));
    }

    @GetMapping("/my/joined")
    @Operation(
            summary = "내가 가입한 모임 목록 조회",
            description = "내가 가입한 모임 목록을 조회합니다."
    )
    public ApiSuccessResponse<PageResponse<GroupFetchResponse>> getJoinedGroups(
            @Parameter(hidden = true) @Login UserToken userToken,
            @ParameterObject Pageable pageable) {
        return ApiSuccessResponse.of(groupService.getJoinedGroups(userToken, pageable));
    }

    @Operation(
            summary = "내가 생성한 모임 목록 조회",
            description = "내가 생성한 모임 목록을 조회합니다."
    )
    @GetMapping("/my/created")
    public ApiSuccessResponse<PageResponse<GroupFetchResponse>> getCreatedGroups(
            @Parameter(hidden = true) @Login UserToken userToken,
            @ParameterObject Pageable pageable) {
        return ApiSuccessResponse.of(groupService.getCreatedGroups(userToken, pageable));
    }

    @Operation(
            summary = "특정 모임 정보 조회",
            description = "특정 모임의 상세 정보를 조회합니다."
    )
    @GetMapping("/{groupId}/info")
    public ApiSuccessResponse<GroupFetchResponse> getGroup(
            @Parameter(hidden = true) @Login(required = false) UserToken userToken,
            @PathVariable long groupId) {
        return ApiSuccessResponse.of(groupService.fetchGroup(userToken, groupId));
    }

    @Operation(
            summary = "모임 정보 수정",
            description = "특정 모임의 정보를 수정합니다. 프로필 사진, 이름, 설명, 태그 등을 수정할 수 있습니다."
    )
    @PatchMapping(value = "/{groupId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiSuccessResponse<GroupPostResponse> updateGroup(
            @Parameter(hidden = true) @Login UserToken userToken,
            @PathVariable long groupId,
            @ModelAttribute @Valid GroupPatchRequest request) {
        return ApiSuccessResponse.of(groupService.updateGroup(userToken, groupId, request));
    }

    @Operation(
            summary = "모임 가입 요청",
            description = "특정 모임에 가입 요청을 보냅니다. 모임장이 승인해야 가입됩니다."
    )
    @PostMapping("/{groupId}/join")
    public ApiSuccessResponse<GroupJoinResponse> requestJoinGroup(
            @Parameter(hidden = true) @Login UserToken userToken,
            @PathVariable long groupId) {
        return ApiSuccessResponse.of(groupMemberService.requestGroupJoin(userToken, groupId));
    }

    @Operation(
            summary = "특정 그룹의 멤버 목록 조회",
            description = "특정 그룹에서 가입된 + 대기중인 멤버 목록을 조회합니다."
    )
    @GetMapping("/{groupId}/members")
    public ApiSuccessResponse<PageResponse<GroupMemberResponse>> getGroupMembers(
            @PathVariable long groupId,
            @ParameterObject Pageable pageable
    ) {
        return ApiSuccessResponse.of(groupMemberService.getGroupMembers(groupId, pageable));
    }
    
    @Operation(
            summary = "모임 가입 요청 승인",
            description = "모임장이 특정 사용자의 가입 요청을 승인합니다."
    )
    @PatchMapping("/{groupId}/members/{userId}/approve")
    public ApiSuccessResponse<GroupJoinResponse> approveJoinRequest(
            @Parameter(hidden = true) @Login UserToken userToken,
            @PathVariable long groupId,
            @PathVariable long userId) {
        return ApiSuccessResponse.of(groupMemberService.approveJoinRequest(userToken, groupId, userId));
    }

    @Operation(
            summary = "모임 가입 요청 거절",
            description = "모임장이 특정 사용자의 가입 요청을 거절합니다."
    )
    @PatchMapping("/{groupId}/members/{userId}/reject")
    public ApiSuccessResponse<Void> rejectJoinRequest(
            @Parameter(hidden = true) @Login UserToken userToken,
            @PathVariable long groupId,
            @PathVariable long userId) {
        groupMemberService.rejectJoinRequest(userToken, groupId, userId);
        return ApiSuccessResponse.emptyResponse();
    }

    @Operation(
            summary = "모임 탈퇴",
            description = "가입된 모임에서 탈퇴합니다."
    )
    @DeleteMapping("/{groupId}/members/leave")
    public ApiSuccessResponse<Void> leaveGroup(
            @Parameter(hidden = true) @Login UserToken userToken,
            @PathVariable long groupId) {
        groupMemberService.leaveGroup(userToken, groupId);
        return ApiSuccessResponse.emptyResponse();
    }

    @Operation(
            summary = "모임 대기중인 멤버 목록 조회",
            description = "모임장이 승인 대기 중인 멤버 목록을 조회합니다."
    )
    @GetMapping("/{groupId}/members/pending")
    public ApiSuccessResponse<PageResponse<GroupMemberResponse>> getPendingList(
            @Parameter(hidden = true) @Login UserToken userToken,
            @ParameterObject Pageable pageable,
            @PathVariable long groupId
    ) {
        return ApiSuccessResponse.of(groupMemberService.fetchPendingList(pageable, userToken, groupId));
    }

    @Operation(summary = "모임 멤버 추방", description = "모임장만 멤버를 추방할 수 있습니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "성공"),
            @ApiResponse(responseCode = "400", description = """
                    다음과 같은 비즈니스 에러 발생 가능:
                    - GROUP_LEADER_CANNOT_LEAVE
                    - GROUP_MEMBER_NOT_JOINED
                    """
            ),
            @ApiResponse(responseCode = "403", description = """
                    다음과 같은 비즈니스 에러 발생 가능:
                    - GROUP_LEADER_ONLY
                    """
            )
    })
    @PostMapping("/{groupId}/members/{userId}/kick")
    public ApiSuccessResponse<Void> kickGroupMember(
            @Parameter(hidden = true) @Login UserToken userToken,
            @PathVariable Long groupId,
            @PathVariable Long userId
    ) {
        groupMemberService.kickGroupMember(userToken, groupId, userId);
        return ApiSuccessResponse.emptyResponse();
    }

    @Operation(summary = "모임 삭제", description = "모임지기가 하이라이트 연결을 끊고 모임과 자식 엔티티를 삭제할 수 있습니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "성공"),
            @ApiResponse(responseCode = "403", description = """
                    다음과 같은 비즈니스 에러 발생 가능:
                    - GROUP_LEADER_ONLY
                    """
            )
    })
    @DeleteMapping("/{groupId}")
    public ApiSuccessResponse<Void> deleteGroup(
            @Parameter(hidden = true) @Login UserToken userToken,
            @PathVariable Long groupId
    ) {
        groupService.deleteGroup(userToken, groupId);
        return ApiSuccessResponse.emptyResponse();
    }
}
