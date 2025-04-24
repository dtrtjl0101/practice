package qwerty.chaekit.dto.ebook;

import lombok.Builder;
import lombok.Getter;
import qwerty.chaekit.domain.ebook.Ebook;

@Getter
@Builder
public class EbookSearchResponse {
    private Long id;
    private String title;
    private String author;
    private String coverImageUrl;

    public static EbookSearchResponse of(Ebook ebook) {
        return EbookSearchResponse.builder()
                .id(ebook.getId())
                .title(ebook.getTitle())
                .author(ebook.getAuthor())
                .build();
    }
} 