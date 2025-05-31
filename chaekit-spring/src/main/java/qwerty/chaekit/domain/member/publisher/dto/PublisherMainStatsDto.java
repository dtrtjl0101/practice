package qwerty.chaekit.domain.member.publisher.dto;

import java.util.Optional;

public record PublisherMainStatsDto(
        Long totalSalesCount,
        Long totalRevenue,
        Long totalActivityCount,
        Long totalViewCount,
        Long currentMonthSalesCount,
        Long previousMonthSalesCount,
        Long currentMonthRevenue,
        Long previousMonthRevenue,
        Long currentMonthActivityCount,
        Long previousMonthActivityCount
) {
    public long increasedSalesCount() {
        return Optional.ofNullable(currentMonthSalesCount).orElse(0L)
                - Optional.ofNullable(previousMonthSalesCount).orElse(0L);
    }

    public long increasedRevenue() {
        return Optional.ofNullable(currentMonthRevenue).orElse(0L)
                - Optional.ofNullable(previousMonthRevenue).orElse(0L);
    }

    public long increasedActivityCount() {
        return Optional.ofNullable(currentMonthActivityCount).orElse(0L)
                - Optional.ofNullable(previousMonthActivityCount).orElse(0L);
    }
}
