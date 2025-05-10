package qwerty.chaekit.domain.notification;

public enum NotificationType {

    GROUP_JOIN_REQUEST("그룹 가입 요청"),
    GROUP_JOIN_APPROVED("그룹 가입 승인"),
    GROUP_JOIN_REJECTED("그룹 가입 거절");

    private final String description;

    NotificationType(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
} 