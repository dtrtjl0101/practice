package qwerty.chaekit.controller.group;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;
import qwerty.chaekit.dto.group.review.GroupReviewFetchResponse;
import qwerty.chaekit.dto.group.review.GroupReviewPostRequest;
import qwerty.chaekit.dto.group.review.GroupReviewStatsResponse;
import qwerty.chaekit.dto.page.PageResponse;
import qwerty.chaekit.global.response.ApiSuccessResponse;
import qwerty.chaekit.global.security.resolver.Login;
import qwerty.chaekit.global.security.resolver.UserToken;
import qwerty.chaekit.service.group.GroupReviewService;

@RestController
@RequestMapping("/api/groups/{groupId}/reviews")
@RequiredArgsConstructor
public class GroupReviewController {
    private final GroupReviewService groupReviewService;

    @PostMapping
    @Operation(summary = "모임 리뷰 작성", description = "모임에 새로운 리뷰를 작성합니다.")
    public ApiSuccessResponse<GroupReviewFetchResponse> createReview(
            @Parameter(hidden = true) @Login UserToken userToken,
            @PathVariable Long groupId,
            @Valid @RequestBody GroupReviewPostRequest request
    ) {
        return ApiSuccessResponse.of(groupReviewService.createReview(userToken, groupId, request));
    }

    @GetMapping
    @Operation(summary = "모임 리뷰 목록 조회", description = "모임의 리뷰 목록을 조회합니다.")
    public ApiSuccessResponse<PageResponse<GroupReviewFetchResponse>> getReviews(
            @PathVariable Long groupId,
            @ParameterObject Pageable pageable
    ) {
        return ApiSuccessResponse.of(groupReviewService.getReviews(groupId, pageable));
    }

    @GetMapping("/stats")
    public ApiSuccessResponse<GroupReviewStatsResponse> getReviewStats(
            @PathVariable Long groupId
    ) {
        return ApiSuccessResponse.of(groupReviewService.getReviewStats(groupId));
    }
}