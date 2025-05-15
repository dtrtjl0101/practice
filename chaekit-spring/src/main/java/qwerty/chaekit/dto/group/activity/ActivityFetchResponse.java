package qwerty.chaekit.dto.group.activity;

import lombok.Builder;
import qwerty.chaekit.domain.group.activity.Activity;

import java.time.LocalDate;

@Builder
public record ActivityFetchResponse(
        Long activityId,
        Long bookId,
        String bookTitle,
        String bookAuthor,
        String coverImageKey,
        String bookDescription,
        LocalDate startTime,
        LocalDate endTime,
        String description
) {
    public static ActivityFetchResponse of(Activity activity) {
        return ActivityFetchResponse.builder()
                .activityId(activity.getId())
                .bookId(activity.getBook().getId())
                .bookTitle(activity.getBook().getTitle())
                .bookAuthor(activity.getBook().getAuthor())
                .coverImageKey(activity.getBook().getCoverImageKey())
                .bookDescription(activity.getBook().getDescription())
                .startTime(activity.getStartTime())
                .endTime(activity.getEndTime())
                .description(activity.getDescription())
                .build();
    }
}
