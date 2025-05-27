package qwerty.chaekit.dto.ebook.request;

import lombok.Builder;

@Builder
public record EbookRequestFetchResponse(
    Long id,
    String title,
    String author,
    String description,
    long size,
    int price,
    String coverImageURL,
    Long publisherId,
    String publisherName,
    String publisherEmail,
    String rejectReason
) { }
