package qwerty.chaekit.service.member.publisher;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import qwerty.chaekit.domain.member.publisher.PublisherProfile;
import qwerty.chaekit.domain.member.publisher.PublisherProfileRepository;
import qwerty.chaekit.domain.member.publisher.PublisherStatsRepository;
import qwerty.chaekit.domain.member.publisher.dto.PublisherMainStatsDto;
import qwerty.chaekit.domain.member.publisher.dto.StatsPerEbookDto;
import qwerty.chaekit.dto.member.PublisherInfoResponse;
import qwerty.chaekit.dto.member.PublisherStatsResponse;
import qwerty.chaekit.global.enums.ErrorCode;
import qwerty.chaekit.global.exception.NotFoundException;
import qwerty.chaekit.global.security.resolver.PublisherToken;
import qwerty.chaekit.service.util.EntityFinder;
import qwerty.chaekit.service.util.FileService;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class PublisherService {
    private final PublisherProfileRepository publisherRepository;
    private final FileService fileService;
    private final EntityFinder entityFinder;
    private final PublisherStatsRepository publisherStatsRepository;

    public PublisherInfoResponse getPublisherProfile(PublisherToken token) {
        PublisherProfile publisher = publisherRepository.findById(token.publisherId())
                .orElseThrow(() -> new NotFoundException(ErrorCode.PUBLISHER_NOT_FOUND));
        String imageURL = fileService.convertToPublicImageURL(publisher.getProfileImageKey());

        return PublisherInfoResponse.of(publisher, imageURL);
    }
    
    public PublisherStatsResponse getPublisherStats(PublisherToken token) {
        PublisherProfile publisher = entityFinder.findPublisher(token.publisherId());

        PublisherMainStatsDto publisherMainStats = publisherStatsRepository.getPublisherMainStatistic(publisher.getId(), LocalDate.now());

        List<PublisherStatsResponse.MonthlyRevenue> monthlyRevenueList
                = publisherStatsRepository.getMonthlyRevenueList(publisher.getId());
        List<PublisherStatsResponse.SalesCountPerEbook> increasedSalesCountsPerEbook
                = publisherStatsRepository.getIncreasedSalesCountsPerEbook(publisher.getId(), LocalDate.now());
        List<StatsPerEbookDto> statsPerEbookList
                = publisherStatsRepository.getStatsPerEbook(publisher.getId());

        return PublisherStatsResponse.builder()
                .totalSalesCount(publisherMainStats.totalSalesCount())
                .totalRevenue(publisherMainStats.totalRevenue())
                .totalActivityCount(publisherMainStats.totalActivityCount())
                .totalViewCount(publisherMainStats.totalViewCount())
                .increasedSalesCount(publisherMainStats.increasedSalesCount())
                .increasedRevenue(publisherMainStats.increasedRevenue())
                .increasedActivityCount(publisherMainStats.increasedActivityCount())
                .monthlyRevenueList(monthlyRevenueList)
                .increasedSalesCountsPerEbook(increasedSalesCountsPerEbook)
                .statsPerEbookList(statsPerEbookList.stream()
                        .map(stats -> new PublisherStatsResponse.StatsPerEbook(
                                stats.bookId(),
                                stats.title(),
                                stats.author(),
                                fileService.convertToPublicImageURL(stats.bookCoverImageKey()),
                                stats.totalSalesCount(),
                                stats.totalRevenue(),
                                stats.viewCount(),
                                stats.activityCount(),
                                stats.createdAt().toLocalDate()
                        )).toList())
                .build();
    }
}
