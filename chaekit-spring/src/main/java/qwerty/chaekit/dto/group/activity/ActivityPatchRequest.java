package qwerty.chaekit.dto.group.activity;

import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import org.hibernate.validator.constraints.Length;

import java.time.LocalDate;

@Builder
public record ActivityPatchRequest(
        @NotNull
        Long activityId,
        LocalDate startTime,
        LocalDate endTime,
        @Length(max = 5000)
        String description
) { }
