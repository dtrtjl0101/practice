package qwerty.chaekit.dto.group.activity;

import jakarta.validation.constraints.NotNull;
import lombok.Builder;

import java.time.LocalDate;

@Builder
public record ActivityPatchRequest(
        @NotNull
        Long activityId,
        LocalDate startTime,
        LocalDate endTime,
        String description
) { }
