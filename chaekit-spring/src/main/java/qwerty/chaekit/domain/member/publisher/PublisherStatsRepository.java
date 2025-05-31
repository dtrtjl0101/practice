package qwerty.chaekit.domain.member.publisher;

import qwerty.chaekit.domain.member.publisher.dto.PublisherMainStatsDto;
import qwerty.chaekit.domain.member.publisher.dto.StatsPerEbookDto;
import qwerty.chaekit.dto.member.PublisherStatsResponse;

import java.time.LocalDate;
import java.util.List;

public interface PublisherStatsRepository {
    PublisherMainStatsDto getPublisherMainStatistic(Long publisherId, LocalDate currentDate);
    List<PublisherStatsResponse.MonthlyRevenue> getMonthlyRevenueList(Long publisherId);
    List<PublisherStatsResponse.SalesCountPerEbook> getIncreasedSalesCountsPerEbook(Long publisherId, LocalDate currentDate);
    List<StatsPerEbookDto> getStatsPerEbook(Long publisherId);
}
