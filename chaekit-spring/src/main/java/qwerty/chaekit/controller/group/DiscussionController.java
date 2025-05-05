package qwerty.chaekit.controller.group;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;
import qwerty.chaekit.dto.group.activity.discussion.DiscussionDetailResponse;
import qwerty.chaekit.dto.group.activity.discussion.DiscussionFetchResponse;
import qwerty.chaekit.dto.group.activity.discussion.DiscussionPostRequest;
import qwerty.chaekit.dto.page.PageResponse;
import qwerty.chaekit.global.security.resolver.Login;
import qwerty.chaekit.global.security.resolver.UserToken;

@RestController
@RequestMapping("/api/activities/{activityId}/discussions")
@Tag(name = "토론", description = "토론 관련 API")
public class DiscussionController {
    @Operation(
            summary = "토론 목록 조회",
            description = "특정 활동에 해당하는 토론 목록을 조회합니다."
    )
    @GetMapping
    public PageResponse<DiscussionFetchResponse> getDiscussions(
            @ParameterObject Pageable pageable,
            @PathVariable Long activityId
    ) {

        return null;
    }

    @Operation(
            summary = "토론 생성",
            description = "특정 활동에 새로운 토론을 생성합니다."
    )
    @PostMapping
    public DiscussionFetchResponse createDiscussion(
            @Login UserToken userToken,
            @PathVariable Long activityId,
            @RequestBody DiscussionPostRequest discussion
    ) {

        return null;
    }

    @Operation(
            summary = "토론 상세 조회",
            description = "특정 토론에 대해 댓글 등을 포함한 상세 정보를 조회합니다."
    )
    @GetMapping("/{discussionId}")
    public DiscussionDetailResponse getDiscussion(
            @PathVariable Long activityId,
            @PathVariable Long discussionId
    ) {

        return null;
    }

    @Operation(
            summary = "토론 수정",
            description = "토론 제목, 내용, 찬반 여부를 수정합니다."
    )
    @PatchMapping("/{discussionId}")
    public DiscussionFetchResponse updateDiscussion(
            @Login UserToken userToken,
            @PathVariable Long activityId,
            @PathVariable Long discussionId,
            @RequestBody DiscussionPostRequest discussion
    ) {

        return null;
    }
}
