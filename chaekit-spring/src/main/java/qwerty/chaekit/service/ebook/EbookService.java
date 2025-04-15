package qwerty.chaekit.service.ebook;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import qwerty.chaekit.domain.ebook.EbookRepository;
import qwerty.chaekit.dto.ebook.EbookFetchResponse;
import qwerty.chaekit.dto.page.PageResponse;

@Service
@RequiredArgsConstructor
public class EbookService {
    private final EbookRepository ebookRepository;

    public PageResponse<EbookFetchResponse> fetchEbookList(Pageable pageable) {
        Page<EbookFetchResponse> page = ebookRepository.findAll(pageable)
                .map(EbookFetchResponse::of);
        return PageResponse.of(page);
    }
}
