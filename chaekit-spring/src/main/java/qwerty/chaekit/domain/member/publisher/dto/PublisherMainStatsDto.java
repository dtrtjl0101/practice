package qwerty.chaekit.domain.member.publisher.dto;

public record PublisherMainStatsDto(
        Long totalSalesCount,
        Long totalRevenue,
        Long totalActivityCount,
        Long totalViewCount,
        Long increasedSalesCount,
        Long increasedRevenue,
        Long increasedActivityCount
) { }
