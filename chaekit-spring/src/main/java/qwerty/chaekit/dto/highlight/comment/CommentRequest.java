package qwerty.chaekit.dto.highlight.comment;

public record CommentRequest(
    String content,
    Long parentId
) {
} 