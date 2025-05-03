package qwerty.chaekit.dto.highlight.comment;

import qwerty.chaekit.domain.highlight.entity.comment.HighlightComment;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

public record CommentResponse(
    Long id,
    Long authorId,
    String authorName,
    String content,
    LocalDateTime createdAt,
    LocalDateTime updatedAt,
    List<CommentResponse> replies
) {
    public static CommentResponse of(HighlightComment comment) {
        List<CommentResponse> replies = comment.getReplies().stream()
                .map(CommentResponse::of)
                .collect(Collectors.toList());
                
        return new CommentResponse(
            comment.getId(),
            comment.getAuthor().getId(),
            comment.getAuthor().getNickname(),
            comment.getContent(),
            comment.getCreatedAt(),
            comment.getModifiedAt(),
            replies
        );
    }
} 