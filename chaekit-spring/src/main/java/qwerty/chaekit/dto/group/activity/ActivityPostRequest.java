package qwerty.chaekit.dto.group.activity;

import jakarta.validation.constraints.NotNull;
import lombok.Builder;

import java.time.LocalDate;

@Builder
public record ActivityPostRequest(
        @NotNull
        Long bookId,
        @NotNull
        LocalDate startTime,
        @NotNull
        LocalDate endTime,
        String description
) { }
