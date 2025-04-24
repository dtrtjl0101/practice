package qwerty.chaekit.service.ebook;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import qwerty.chaekit.domain.ebook.EbookRepository;
import qwerty.chaekit.dto.ebook.EbookFetchResponse;
import qwerty.chaekit.dto.page.PageResponse;
import qwerty.chaekit.service.util.S3Service;

@Service
@RequiredArgsConstructor
public class EbookService {
    private final EbookRepository ebookRepository;
    private final S3Service s3Service;

    public PageResponse<EbookFetchResponse> fetchEbookList(Pageable pageable) {
        Page<EbookFetchResponse> page = ebookRepository.findAll(pageable)
                .map( ebook -> EbookFetchResponse.of(
                        ebook, s3Service.convertToPublicImageURL(ebook.getFileKey())
                        ));
        return PageResponse.of(page);
    }
}
