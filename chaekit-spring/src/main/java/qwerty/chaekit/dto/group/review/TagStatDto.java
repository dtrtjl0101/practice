package qwerty.chaekit.dto.group.review;

import qwerty.chaekit.domain.group.review.GroupReviewTag;

public record TagStatDto(
        GroupReviewTag tag,
        long count
) {
}
