package qwerty.chaekit.mapper;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import qwerty.chaekit.domain.ebook.purchase.EbookPurchase;
import qwerty.chaekit.dto.ebook.purchase.ReadingProgressResponse;
import qwerty.chaekit.service.util.FileService;

@Component
@RequiredArgsConstructor
public class ReadingProgressMapper {
    private final FileService fileService;

    public String convertToPublicImageURL(String imageKey) {
        return fileService.convertToPublicImageURL(imageKey);
    }

    public ReadingProgressResponse toResponse(EbookPurchase ebookPurchase) {
        return ReadingProgressResponse.builder()
                .bookId(ebookPurchase.getEbook().getId())
                .userId(ebookPurchase.getUser().getId())
                .userNickname(ebookPurchase.getUser().getNickname())
                .userProfileImageURL(convertToPublicImageURL(ebookPurchase.getUser().getProfileImageKey()))
                .cfi(ebookPurchase.getCfi())
                .percentage(ebookPurchase.getPercentage())
                .build();
    }
}
