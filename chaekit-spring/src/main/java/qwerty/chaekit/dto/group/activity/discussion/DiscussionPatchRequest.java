package qwerty.chaekit.dto.group.activity.discussion;

import java.util.List;

public record DiscussionPatchRequest(
        String title,
        String content,
        List<Long> highlightIds
) { }
