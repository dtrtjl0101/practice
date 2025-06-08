package qwerty.chaekit.dto.ebook.upload;

import lombok.Builder;
import qwerty.chaekit.domain.ebook.Ebook;

@Builder
public record EbookPostResponse(
        Long requestId,
        Long bookId,
        String title,
        String author,
        String description,
        String coverImageURL
) {
    public static EbookPostResponse of(Ebook ebook, Long requestId, String coverImageURL) {
        return EbookPostResponse.builder()
                .requestId(requestId)
                .bookId(ebook.getId())
                .title(ebook.getTitle())
                .author(ebook.getAuthor())
                .description(ebook.getDescription())
                .coverImageURL(coverImageURL)
                .build();
    }
}
