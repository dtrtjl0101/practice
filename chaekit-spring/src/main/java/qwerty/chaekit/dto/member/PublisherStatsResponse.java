package qwerty.chaekit.dto.member;

import lombok.Builder;

import java.time.LocalDate;
import java.util.List;

// total:           전체 기간
// monthlyTotal:    월별
// increased:       마지막 달 증가 수치

@Builder
public record PublisherStatsResponse(
        Long totalSalesCount,
        Long increasedSalesCount,

        Long totalRevenue,
        Long increasedRevenue,

        Long totalActivityCount,
        Long increasedActivityCount,

        Long totalViewCount,
        
        List<MonthlyRevenue> monthlyRevenueList,
        List<SalesCountPerEbook> increasedSalesCountsPerEbook,
        List<StatsPerEbook> statsPerEbookList
) {
    public record SalesCountPerEbook(
            Long bookId,
            String bookName,
            Long totalSalesCount
    ) { }
    
    public record MonthlyRevenue(
            String month,
            Long monthlyRevenue
    ) { }
    
    public record StatsPerEbook(
            Long bookId,
            String title,
            String author,
            String bookCoverImageURL,
            Long totalSalesCount,
            Long totalRevenue,
            Long viewCount,
            Long activityCount,
            LocalDate createdAt
    ) { }
}
