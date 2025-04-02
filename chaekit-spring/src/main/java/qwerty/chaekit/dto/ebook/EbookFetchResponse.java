package qwerty.chaekit.dto.ebook;

import lombok.Builder;
import qwerty.chaekit.domain.ebook.Ebook;

@Builder
public record EbookFetchResponse(
        Long id,
        String title,
        String author,
        String description,
        Long size
) {
    public static EbookFetchResponse of(Ebook ebook) {
        return EbookFetchResponse.builder()
                .id(ebook.getId())
                .title(ebook.getTitle())
                .author(ebook.getAuthor())
                .description(ebook.getDescription())
                .size(ebook.getSize())
                .build();
    }
}
