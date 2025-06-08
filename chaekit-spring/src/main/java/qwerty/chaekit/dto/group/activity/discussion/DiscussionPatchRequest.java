package qwerty.chaekit.dto.group.activity.discussion;

import org.hibernate.validator.constraints.Length;

import java.util.List;

public record DiscussionPatchRequest(
        @Length(max = 100)
        String title,
        @Length(max = 5000)
        String content,
        List<Long> highlightIds
) { }
