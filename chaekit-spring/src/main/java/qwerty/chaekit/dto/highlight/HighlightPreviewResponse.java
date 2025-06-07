package qwerty.chaekit.dto.highlight;

import lombok.Builder;
import qwerty.chaekit.domain.highlight.Highlight;

import java.time.LocalDateTime;

@Builder
public record HighlightPreviewResponse(
        Long id,
        Long authorId,
        String authorName,
        String authorProfileImageURL,
        String spine,
        String cfi,
        LocalDateTime createdAt
) {
    /*
     * fetch required:
     *   - highlight.author
     */
    public static HighlightPreviewResponse of(Highlight highlight, String authorProfileImageURL) {
        return HighlightPreviewResponse.builder()
                .id(highlight.getId())
                .authorId(highlight.getAuthor().getId())
                .authorName(highlight.getAuthor().getNickname())
                .authorProfileImageURL(authorProfileImageURL)
                .spine(highlight.getSpine())
                .cfi(highlight.getCfi())
                .createdAt(highlight.getCreatedAt())
                .build();
    }
}
