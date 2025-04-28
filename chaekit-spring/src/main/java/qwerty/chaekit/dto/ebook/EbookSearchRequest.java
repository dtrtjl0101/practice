package qwerty.chaekit.dto.ebook;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EbookSearchRequest {
    private String authorName;
    private String bookTitle;
} 