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
        return new EbookRequestFetchResponse(
                ebookRequest.getId(),
                ebookRequest.getTitle(),
                ebookRequest.getAuthor(),
                ebookRequest.getDescription(),
                ebookRequest.getSize(),
                ebookRequest.getPrice(),
                convertToPublicImageURL(ebookRequest.getCoverImageKey()),
                ebookRequest.getPublisher().getId(),
                ebookRequest.getPublisher().getPublisherName(),
                ebookRequest.getPublisher().getMember().getEmail(),
                ebookRequest.getRejectReason()
        );
    }
}
