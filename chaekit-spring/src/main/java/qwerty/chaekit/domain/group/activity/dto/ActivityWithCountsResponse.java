package qwerty.chaekit.domain.group.activity.dto;

import qwerty.chaekit.domain.group.activity.Activity;

public record ActivityWithCountsResponse(
        Activity activity,
        long discussionCount,
        long highlightCount
) {
}
