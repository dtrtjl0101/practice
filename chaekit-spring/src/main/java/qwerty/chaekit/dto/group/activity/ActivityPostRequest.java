package qwerty.chaekit.dto.group.activity;

import java.time.LocalDate;

public record ActivityPostRequest(
        Long bookId,
        LocalDate startTime,
        LocalDate endTime
) { }
