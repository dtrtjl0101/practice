package qwerty.chaekit.dto.member;

import lombok.Builder;

import java.time.LocalDate;
import java.util.List;

@Builder
public record PublisherStatsResponse(
        Long totalSalesCount,
        Long increasedSalesCount,

        Long totalRevenue,
        Long increasedRevenue,

        Long totalActivityCount,
        Long increasedActivityCount,

        Long totalViewCount,
        
        List<MonthlyTotalSales> monthlyTotalRevenueList,
        List<SalesPerEbook> salesCountPerEbookList,
        
        List<StatsPerEbook> statsPerEbookList
) {
    public record SalesPerEbook(
            Long bookId,
            String bookName,
            Long sales
    ) { }
    
    public record MonthlyTotalSales(
            LocalDate month,
            Long sales
    ) { }
    
    public record StatsPerEbook(
            Long bookId,
            String bookName,
            String author,
            String bookCoverImageURL,
            Long totalSalesCount,
            Long totalRevenue,
            Long viewCount,
            Long activityCount,
            LocalDate createdAt
    ) { }
}
