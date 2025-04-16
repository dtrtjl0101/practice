package qwerty.chaekit.dto.group.activity;

import lombok.Builder;
import qwerty.chaekit.domain.group.activity.Activity;

import java.time.LocalDate;

@Builder
public record ActivityPostResponse(
        Long activityId,
        Long bookId,
        LocalDate startTime,
        LocalDate endTime,
        String description
) {
    public static ActivityPostResponse of(Activity activity) {
        return ActivityPostResponse.builder()
                .activityId(activity.getId())
                .bookId(activity.getBook().getId())
                .startTime(activity.getStartTime())
                .endTime(activity.getEndTime())
                .description(activity.getDescription())
                .build();
    }
}
