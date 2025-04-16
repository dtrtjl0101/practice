package qwerty.chaekit.dto.group.activity;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record ActivityPostRequest(
        @NotNull
        Long bookId,
        @NotNull
        LocalDate startTime,
        @NotNull
        LocalDate endTime,
        String description
) { }
