package qwerty.chaekit.controller.group;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;
import qwerty.chaekit.dto.group.activity.discussion.DiscussionDetailResponse;
import qwerty.chaekit.dto.group.activity.discussion.DiscussionFetchResponse;
import qwerty.chaekit.dto.group.activity.discussion.DiscussionPatchRequest;
import qwerty.chaekit.dto.group.activity.discussion.DiscussionPostRequest;
import qwerty.chaekit.dto.page.PageResponse;
import qwerty.chaekit.global.security.resolver.Login;
import qwerty.chaekit.global.security.resolver.UserToken;
import qwerty.chaekit.service.group.DiscussionService;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "토론", description = "토론 관련 API")
public class DiscussionController {
    private final DiscussionService discussionService;

    @Operation(
            summary = "토론 목록 조회",
            description = "특정 활동에 해당하는 토론 목록을 조회합니다."
    )
    @GetMapping("/activities/{activityId}/discussions")
    public PageResponse<DiscussionFetchResponse> getDiscussions(
            @Parameter(hidden = true) @Login(required = false) UserToken userToken,
            @ParameterObject Pageable pageable,
            @PathVariable Long activityId
    ) {
        return discussionService.getDiscussions(userToken, pageable, activityId);
    }

    @Operation(
            summary = "토론 생성",
            description = "특정 활동에 새로운 토론을 생성합니다."
    )
    @PostMapping("/activities/{activityId}/discussions")
    public DiscussionFetchResponse createDiscussion(
            @Parameter(hidden = true) @Login UserToken userToken,
            @PathVariable Long activityId,
            @RequestBody @Valid DiscussionPostRequest request
    ) {
        return discussionService.createDiscussion(userToken, activityId, request);
    }

    @Operation(
            summary = "토론 상세 조회",
            description = "특정 토론에 대해 댓글 등을 포함한 상세 정보를 조회합니다."
    )
    @GetMapping("/discussions/{discussionId}")
    public DiscussionDetailResponse getDiscussion(
            @Parameter(hidden = true) @Login UserToken userToken,
            @PathVariable Long discussionId
    ) {
        return discussionService.getDiscussionDetail(userToken, discussionId);
    }

    @Operation(
            summary = "토론 수정",
            description = "토론 제목, 내용, 찬반 여부를 수정합니다."
    )
    @PatchMapping("/discussions/{discussionId}")
    public DiscussionFetchResponse updateDiscussion(
            @Parameter(hidden = true) @Login UserToken userToken,
            @PathVariable Long discussionId,
            @RequestBody @Valid DiscussionPatchRequest request
    ) {
        return discussionService.updateDiscussion(userToken, discussionId, request);
    }

    @Operation(
            summary = "토론 삭제",
            description = "토론을 삭제합니다."
    )
    @DeleteMapping("/discussions/{discussionId}")
    public void deleteDiscussion(
            @Parameter(hidden = true) @Login UserToken userToken,
            @PathVariable Long discussionId
    ) {
        discussionService.deleteDiscussion(userToken, discussionId);
    }
}
