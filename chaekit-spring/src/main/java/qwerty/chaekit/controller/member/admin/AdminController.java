package qwerty.chaekit.controller.member.admin;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;
import qwerty.chaekit.dto.member.PublisherInfoResponse;
import qwerty.chaekit.dto.member.UserInfoResponse;
import qwerty.chaekit.dto.member.admin.RejectPublisherRequest;
import qwerty.chaekit.dto.page.PageResponse;
import qwerty.chaekit.global.response.ApiSuccessResponse;
import qwerty.chaekit.service.member.admin.AdminService;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Tag(name = "Admin", description = "관리자 관련 API")
public class AdminController {
    private final AdminService adminService;

    @Operation(
            summary = "출판사 목록 조회",
            description = "모든 출판사 목록을 확인할 수 있습니다."
    )
    @GetMapping("/publishers")
    public ApiSuccessResponse<PageResponse<PublisherInfoResponse>> fetchPublishers(@ParameterObject Pageable pageable) {
        return ApiSuccessResponse.of(adminService.getPublishers(pageable));
    }

    @Operation(
            summary = "유저 목록 조회",
            description = "모든 유저 목록을 확인할 수 있습니다."
    )
    @GetMapping("/users")
    public ApiSuccessResponse<PageResponse<UserInfoResponse>> fetchUsers(@ParameterObject Pageable pageable) {
        return ApiSuccessResponse.of(adminService.getUsers(pageable));
    }

    @Operation(
            summary = "출판사 승인 대기 목록 조회",
            description = "승인 대기 중인 출판사 목록을 확인할 수 있습니다."
    )
    @GetMapping("/publishers/pending")
    public ApiSuccessResponse<PageResponse<PublisherInfoResponse>> fetchPendingList(@ParameterObject Pageable pageable) {
        return ApiSuccessResponse.of(adminService.getPendingPublishers(pageable));
    }

    @Operation(
            summary = "출판사 승인",
            description = "출판사를 승인합니다."
    )
    @PostMapping("/publishers/{publisherId}/accept")
    public ApiSuccessResponse<Void> acceptPublisher(@PathVariable Long publisherId) {
        adminService.acceptPublisher(publisherId);
        return ApiSuccessResponse.emptyResponse();
    }

    @Operation(
            summary = "출판사 거절",
            description = "사유를 제시하며 출판사를 거절합니다."
    )
    @PostMapping("/publishers/{publisherId}/reject")
    public ApiSuccessResponse<Void> rejectPublisher(
            @PathVariable Long publisherId,
            @RequestBody @Valid RejectPublisherRequest request
    ) {
        adminService.rejectPublisher(publisherId, request);
        return ApiSuccessResponse.emptyResponse();
    }
}
