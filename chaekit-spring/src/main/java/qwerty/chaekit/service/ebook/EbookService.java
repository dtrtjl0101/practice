package qwerty.chaekit.service.ebook;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import qwerty.chaekit.domain.ebook.Ebook;
import qwerty.chaekit.domain.ebook.EbookJpaRepository;
import qwerty.chaekit.domain.ebook.EbookRepository;
import qwerty.chaekit.dto.ebook.EbookFetchResponse;
import qwerty.chaekit.dto.ebook.EbookSearchRequest;
import qwerty.chaekit.dto.ebook.EbookSearchResponse;
import qwerty.chaekit.dto.page.PageResponse;
import qwerty.chaekit.service.util.S3Service;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EbookService {
    private final EbookJpaRepository ebookJpaRepository;
    private final EbookRepository ebookRepository;
    private final S3Service s3Service;

    public PageResponse<EbookFetchResponse> fetchEbookList(Pageable pageable) {
        Page<EbookFetchResponse> page = ebookRepository.findAll(pageable)
                .map( ebook -> EbookFetchResponse.of(
                        ebook, s3Service.convertToPublicImageURL(ebook.getCoverImageKey())
                        ));
        return PageResponse.of(page);
    }

    public PageResponse<EbookSearchResponse> searchEbooks(EbookSearchRequest request, Pageable pageable) {
        Page<Ebook> ebooks = ebookRepository.searchEbooks(
                request.getAuthorName(),
                request.getBookTitle(),
                pageable
        );
        return PageResponse.of(ebooks.map(EbookSearchResponse::of));
    }
}
