package qwerty.chaekit.controller.notification;

import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;
import qwerty.chaekit.dto.notification.NotificationResponse;
import qwerty.chaekit.dto.page.PageResponse;
import qwerty.chaekit.global.response.ApiSuccessResponse;
import qwerty.chaekit.global.security.resolver.Login;
import qwerty.chaekit.global.security.resolver.UserToken;
import qwerty.chaekit.service.notification.NotificationService;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {
    private final NotificationService notificationService;

    @Operation(summary = "알림 목록 조회")
    @GetMapping
    public ApiSuccessResponse<PageResponse<NotificationResponse>> getNotifications(
            @Login UserToken userToken,
            Pageable pageable) {
        return ApiSuccessResponse.of(notificationService.getNotifications(userToken, pageable));
    }

    @Operation(summary = "알림 읽음 처리")
    @PatchMapping("/{notificationId}/read")
    public ApiSuccessResponse<Void> markAsRead(
            @Login UserToken userToken,
            @PathVariable Long notificationId) {
        notificationService.markAsRead(userToken, notificationId);
        return ApiSuccessResponse.emptyResponse();
    }
} 