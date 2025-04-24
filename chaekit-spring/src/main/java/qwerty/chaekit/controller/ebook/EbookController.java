package qwerty.chaekit.controller.ebook;

import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;
import qwerty.chaekit.dto.ebook.EbookFetchResponse;
import qwerty.chaekit.dto.ebook.EbookSearchRequest;
import qwerty.chaekit.dto.ebook.EbookSearchResponse;
import qwerty.chaekit.dto.page.PageResponse;
import qwerty.chaekit.global.response.ApiSuccessResponse;
import qwerty.chaekit.service.ebook.EbookService;

@RestController
@RequestMapping("/api/books")
@RequiredArgsConstructor
public class EbookController {
    private final EbookService ebookService;

    @GetMapping
    public ApiSuccessResponse<PageResponse<EbookFetchResponse>>getbooks(@ParameterObject Pageable pageable) {
        return ApiSuccessResponse.of(ebookService.fetchEbookList(pageable));
    }

    @GetMapping("/search")
    public ApiSuccessResponse<PageResponse<EbookSearchResponse>> searchEbooks(
            @ParameterObject Pageable pageable,
            @ModelAttribute EbookSearchRequest request) {
        return ApiSuccessResponse.of(ebookService.searchEbooks(request, pageable));
    }
}
