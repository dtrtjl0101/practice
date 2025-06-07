package qwerty.chaekit.dto.statistics;

import lombok.Builder;

import java.time.LocalDate;

@Builder
public record ReadingProgressHistoryResponse(
        LocalDate date,
        long myPercentage,
        double averagePercentage
) {
}