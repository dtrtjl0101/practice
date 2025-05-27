package qwerty.chaekit.dto.group.review;


import qwerty.chaekit.domain.group.review.GroupReviewTag;

import java.util.List;

public record GroupReviewPostRequest(
        Long activityId,
        String content,
        List<GroupReviewTag> tags
) {
}
