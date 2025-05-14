package qwerty.chaekit.dto.group.activity;

import jakarta.annotation.Nullable;
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
        @Nullable
        String description
) { }
