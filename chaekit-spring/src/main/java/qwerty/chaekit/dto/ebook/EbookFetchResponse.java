package qwerty.chaekit.dto.ebook;

import lombok.Builder;
import qwerty.chaekit.domain.ebook.Ebook;

@Builder
public record EbookFetchResponse(
        Long id,
        String title,
        String bookCoverImageURL,
        String author,
        String description,
        Long size,
        boolean isPurchased,
        int price
) {
    public static EbookFetchResponse of(Ebook ebook, String bookCoverImageURL, boolean isPurchased) {
        return EbookFetchResponse.builder()
                .id(ebook.getId())
                .title(ebook.getTitle())
                .bookCoverImageURL(bookCoverImageURL)
                .author(ebook.getAuthor())
                .description(ebook.getDescription())
                .size(ebook.getSize())
                .isPurchased(isPurchased)
                .price(ebook.getPrice())
                .build();
    }
}
