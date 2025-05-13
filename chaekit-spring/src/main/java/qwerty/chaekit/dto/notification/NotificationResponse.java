package qwerty.chaekit.dto.notification;

import qwerty.chaekit.domain.notification.entity.Notification;
import qwerty.chaekit.domain.notification.entity.NotificationType;

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
        String groupName,
        Long highlightId,
        String highlightComments,
        Long discussionId,
        String discussionContents,
        Long discussionCommentsId,
        String discussionCommentsContents
) {
    public static NotificationResponse of(Notification notification) {
        return new NotificationResponse(
                notification.getId(),
                notification.getMessage(),
                notification.getType(),
                notification.isRead(),
                notification.getCreatedAt(),
                notification.getSender() != null ? notification.getSender().getId() : null,
                notification.getSender() != null ? notification.getSender().getNickname() : null,
                notification.getGroup() != null ? notification.getGroup().getId() : null,
                notification.getGroup() != null ? notification.getGroup().getName() : null,
                notification.getHighlight() != null ? notification.getHighlight().getId() : null,
                notification.getHighlight() != null ? notification.getHighlight().getMemo() : null,
                notification.getDiscussion() != null ? notification.getDiscussion().getId() : null,
                notification.getDiscussion() != null ? notification.getDiscussion().getContent(): null,
                notification.getDiscussionComment()!=null?notification.getDiscussionComment().getId():null,
                notification.getDiscussionComment()!=null?notification.getDiscussionComment().getContent():null
        );
    }
} 