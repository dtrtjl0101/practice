package qwerty.chaekit.service.ebook;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import qwerty.chaekit.domain.ebook.Ebook;
import qwerty.chaekit.domain.ebook.EbookRepository;
import qwerty.chaekit.dto.ebook.EbookFetchResponse;
import qwerty.chaekit.dto.ebook.EbookSearchRequest;
import qwerty.chaekit.dto.ebook.EbookSearchResponse;
import qwerty.chaekit.dto.page.PageResponse;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EbookService {
    private final EbookRepository ebookRepository;

    public PageResponse<EbookFetchResponse> fetchEbookList(Pageable pageable) {
        Page<EbookFetchResponse>page=ebookRepository.findAll(pageable)
                .map(EbookFetchResponse::of);
        return PageResponse.of(page);
    }

    public PageResponse<EbookSearchResponse> searchEbooks(EbookSearchRequest request, Pageable pageable) {
        Page<Ebook> ebooks = ebookRepository.findByAuthorAndTitle(
                request.getAuthorName(),
                request.getBookTitle(),
                pageable
        );
        return PageResponse.of(ebooks.map(EbookSearchResponse::of));
    }
}
