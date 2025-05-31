package qwerty.chaekit.domain.member.publisher;

import qwerty.chaekit.domain.member.publisher.dto.PublisherMainStatsDto;

import java.time.LocalDate;

public interface PublisherStatsRepository {
    PublisherMainStatsDto getPublisherMainStatistic(Long publisherId, LocalDate currentDate);
}
