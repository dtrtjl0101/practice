package qwerty.chaekit.dto.ebook.request;

import lombok.Builder;
import qwerty.chaekit.domain.ebook.request.EbookRequestStatus;

@Builder
public record EbookRequestFetchResponse(
    Long requestId,
    String title,
    String author,
    String description,
    long size,
    int price,
    String coverImageURL,
    Long publisherId,
    String publisherName,
    String publisherEmail,
    EbookRequestStatus status,
    String rejectReason
) { }
