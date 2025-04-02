package qwerty.chaekit.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import qwerty.chaekit.domain.ebook.EbookRepository;
import qwerty.chaekit.dto.ebook.EbookListResponse;
import qwerty.chaekit.dto.ebook.EbookFetchResponse;

@Service
@RequiredArgsConstructor
public class EbookService {
    private final EbookRepository ebookRepository;

    public EbookListResponse fetchEbookList(Pageable pageable) {
        Page<EbookFetchResponse> page = ebookRepository.findAll(pageable)
                .map(EbookFetchResponse::of);
        return EbookListResponse.builder()
                .books(page.getContent())
                .currentPage(page.getNumber())
                .totalItems(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .build();
    }
}
