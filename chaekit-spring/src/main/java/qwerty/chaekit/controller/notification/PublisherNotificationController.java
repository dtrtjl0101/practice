package qwerty.chaekit.controller.notification;

import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;
import qwerty.chaekit.dto.notification.NotificationResponse;
import qwerty.chaekit.dto.page.PageResponse;
import qwerty.chaekit.global.response.ApiSuccessResponse;
import qwerty.chaekit.global.security.resolver.Login;
import qwerty.chaekit.global.security.resolver.PublisherToken;
import qwerty.chaekit.service.notification.PublisherNotificationService;

@RestController
@RequestMapping("/api/publisher/notifications")
@RequiredArgsConstructor
public class PublisherNotificationController {
    private final PublisherNotificationService publisherNotificationService;

    @Operation(summary = "출판사 알림 목록 조회")
    @GetMapping
    public ApiSuccessResponse<PageResponse<NotificationResponse>> getNotifications(
            @Login PublisherToken token,
            Pageable pageable) {
        return ApiSuccessResponse.of(publisherNotificationService.getNotifications(token, pageable));
    }

    @Operation(summary = "출판사 알림 읽음 처리")
    @PatchMapping("/{notificationId}/read")
    public ApiSuccessResponse<Void> markAsRead(
            @Login PublisherToken token,
            @PathVariable Long notificationId) {
        publisherNotificationService.markAsRead(token, notificationId);
        return ApiSuccessResponse.emptyResponse();
    }
} 