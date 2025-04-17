package qwerty.chaekit.controller.all;

import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import qwerty.chaekit.dto.ebook.EbookFetchResponse;
import qwerty.chaekit.dto.page.PageResponse;
import qwerty.chaekit.global.response.ApiSuccessResponse;
import qwerty.chaekit.service.EbookService;

@RestController
@RequestMapping("api/books")
@RequiredArgsConstructor
public class BookController {
    public final EbookService ebookService;

    @GetMapping
    public ApiSuccessResponse<PageResponse<EbookFetchResponse>>getBooks(@ParameterObject Pageable pageable) {
        return ApiSuccessResponse.of(ebookService.fetchEbookList(pageable));
    }
}
