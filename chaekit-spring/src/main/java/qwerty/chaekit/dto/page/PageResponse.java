package qwerty.chaekit.dto.page;

import lombok.Builder;
import org.springframework.data.domain.Page;

import java.util.List;

@Builder
public record PageResponse<T>(
        List<T> content,
        Integer currentPage,
        Long totalItems,
        Integer totalPages
) {
    public static <T> PageResponse<T> of(List<T> content, Integer currentPage, Long totalItems, Integer totalPages) {
        return PageResponse.<T>builder()
                .content(content)
                .currentPage(currentPage)
                .totalItems(totalItems)
                .totalPages(totalPages)
                .build();
    }
    public static <T> PageResponse<T> of(Page<T> page) {
        return PageResponse.<T>builder()
                .content(page.getContent())
                .currentPage(page.getNumber())
                .totalItems(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .build();
    }
}
