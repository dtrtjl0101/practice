package qwerty.chaekit.dto.group.activity;

import lombok.Builder;

import java.time.LocalDate;

@Builder
public record ActivityPatchRequest(
        Long activityId,
        LocalDate startTime,
        LocalDate endTime
) { }
