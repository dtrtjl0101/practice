package qwerty.chaekit.dto.notification;

import qwerty.chaekit.domain.notification.Notification;
import qwerty.chaekit.domain.notification.NotificationType;

import java.time.LocalDateTime;

public record NotificationResponse(
        Long id,
        String message,
        NotificationType type,
        boolean isRead,
        LocalDateTime createdAt,
        Long senderId,
        String senderNickname,
        Long groupId,
        String groupName
) {
    public static NotificationResponse of(Notification notification) {
        return new NotificationResponse(
                notification.getId(),
                notification.getMessage(),
                notification.getType(),
                notification.isRead(),
                notification.getCreatedAt(),
                notification.getSender().getId(),
                notification.getSender().getNickname(),
                notification.getGroup().getId(),
                notification.getGroup().getName()
        );
    }
} 