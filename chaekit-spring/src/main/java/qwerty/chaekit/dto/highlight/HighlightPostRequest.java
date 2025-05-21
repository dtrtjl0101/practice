package qwerty.chaekit.dto.highlight;

import lombok.Builder;
import org.hibernate.validator.constraints.Length;

@Builder
public record HighlightPostRequest(
        Long bookId,
        String spine,
        String cfi,
        Long activityId,
        @Length(max = 1000)
        String memo,
        @Length(max = 500)
        String highlightContent
) { }
