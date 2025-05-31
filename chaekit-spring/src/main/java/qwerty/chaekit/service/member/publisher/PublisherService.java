package qwerty.chaekit.service.member.publisher;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import qwerty.chaekit.domain.member.publisher.PublisherProfile;
import qwerty.chaekit.domain.member.publisher.PublisherProfileRepository;
import qwerty.chaekit.domain.member.publisher.PublisherStatsRepository;
import qwerty.chaekit.domain.member.publisher.dto.PublisherMainStatsDto;
import qwerty.chaekit.dto.member.PublisherInfoResponse;
import qwerty.chaekit.dto.member.PublisherStatsResponse;
import qwerty.chaekit.global.enums.ErrorCode;
import qwerty.chaekit.global.exception.NotFoundException;
import qwerty.chaekit.global.security.resolver.PublisherToken;
import qwerty.chaekit.service.util.EntityFinder;
import qwerty.chaekit.service.util.FileService;

import java.time.LocalDate;

@Slf4j
@Service
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

        return PublisherStatsResponse.builder()
                .totalSalesCount(publisherMainStats.totalSalesCount())
                .totalRevenue(publisherMainStats.totalRevenue())
                .totalActivityCount(publisherMainStats.totalActivityCount())
                .totalViewCount(publisherMainStats.totalViewCount())
                .increasedSalesCount(publisherMainStats.increasedSalesCount())
                .increasedRevenue(publisherMainStats.increasedRevenue())
                .increasedActivityCount(publisherMainStats.increasedActivityCount())
                .build();
    }
}
