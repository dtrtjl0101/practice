package qwerty.chaekit.dto.ebook.request;

import jakarta.annotation.Nullable;
import lombok.Builder;
import qwerty.chaekit.domain.ebook.request.EbookRequestStatus;

@Builder
public record EbookRequestFetchResponse(
        Long requestId,
        @Nullable Long bookId,
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
