package qwerty.chaekit.mapper;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import qwerty.chaekit.domain.ebook.request.EbookRequest;
import qwerty.chaekit.dto.ebook.request.EbookRequestFetchResponse;
import qwerty.chaekit.service.util.FileService;

@Component
@RequiredArgsConstructor
public class EbookRequestMapper {
    private final FileService fileService;

    public String convertToPublicImageURL(String imageKey) {
        return fileService.convertToPublicImageURL(imageKey);
    }

    public EbookRequestFetchResponse toFetchResponse(EbookRequest ebookRequest) {
        return EbookRequestFetchResponse.builder()
                .requestId(ebookRequest.getId())
                .title(ebookRequest.getTitle())
                .author(ebookRequest.getAuthor())
                .description(ebookRequest.getDescription())
                .size(ebookRequest.getSize())
                .price(ebookRequest.getPrice())
                .coverImageURL(convertToPublicImageURL(ebookRequest.getCoverImageKey()))
                .publisherId(ebookRequest.getPublisher().getId())
                .publisherName(ebookRequest.getPublisher().getPublisherName())
                .publisherEmail(ebookRequest.getPublisher().getMember().getEmail())
                .status(ebookRequest.getStatus())
                .rejectReason(ebookRequest.getRejectReason())
                .build();
    }
}
