package qwerty.chaekit.dto.group.review;

import lombok.Builder;

import java.util.List;

@Builder
public record GroupReviewStatsResponse(
        long reviewCount,
        long tagCount,
        List<TagStatDto> tagStats
) {
}
