package qwerty.chaekit.dto.group.activity;

import lombok.Builder;
import qwerty.chaekit.domain.group.activity.Activity;

import java.time.LocalDate;

@Builder
public record ActivityFetchResponse(
        Long activityId,
        Long bookId,
        LocalDate startTime,
        LocalDate endTime
) {
    public static ActivityFetchResponse of(Activity activity) {
        return ActivityFetchResponse.builder()
                .activityId(activity.getId())
                .bookId(activity.getBook().getId())
                .startTime(activity.getStartTime())
                .endTime(activity.getEndTime())
                .build();
    }
}
