package qwerty.chaekit.service.ebook;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import qwerty.chaekit.domain.ebook.Ebook;
import qwerty.chaekit.domain.ebook.repository.EbookRepository;
import qwerty.chaekit.dto.ebook.EbookFetchResponse;
import qwerty.chaekit.dto.page.PageResponse;
import qwerty.chaekit.global.enums.ErrorCode;
import qwerty.chaekit.global.exception.NotFoundException;
import qwerty.chaekit.service.util.FileService;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EbookService {
    private final EbookRepository ebookRepository;
    private final FileService fileService;

    public PageResponse<EbookFetchResponse> fetchBooksByQuery(Pageable pageable, String title, String author) {
        Page<EbookFetchResponse> page = ebookRepository.findAllByTitleAndAuthor(title, author, pageable)
                .map( ebook -> EbookFetchResponse.of(
                        ebook, fileService.convertToPublicImageURL(ebook.getCoverImageKey())
                ));
        return PageResponse.of(page);
    }

    public EbookFetchResponse fetchById(Long ebookId) {
        Ebook ebook = ebookRepository.findById(ebookId)
                .orElseThrow(() -> new NotFoundException(ErrorCode.EBOOK_NOT_FOUND));
        return EbookFetchResponse.of(
                ebook,
                fileService.convertToPublicImageURL(ebook.getCoverImageKey())
        );
    }
}
