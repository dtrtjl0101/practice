package qwerty.chaekit.dto.highlight.comment;

import org.hibernate.validator.constraints.Length;

public record HighlightCommentRequest(
        @Length(max = 1000) 
        String content, 
        Long parentId
) {
} 