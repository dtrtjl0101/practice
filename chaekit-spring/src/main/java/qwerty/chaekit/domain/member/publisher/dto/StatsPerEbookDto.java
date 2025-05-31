package qwerty.chaekit.domain.member.publisher.dto;

import java.time.LocalDateTime;

public record StatsPerEbookDto(
        Long bookId,
        String title,
        String author,
        String bookCoverImageKey,
        Long totalSalesCount,
        Long totalRevenue,
        Long viewCount,
        Long activityCount,
        LocalDateTime createdAt
) { }
