package qwerty.chaekit.dto.highlight;

import lombok.Builder;

import java.util.List;

@Builder
public record HighlightListResponse(
        List<HighlightFetchResponse> highlights,
        Integer currentPage,
        Long totalItems,
        Integer totalPages
) { }
