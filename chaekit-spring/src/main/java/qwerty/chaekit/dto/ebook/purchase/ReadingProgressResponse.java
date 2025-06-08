package qwerty.chaekit.dto.ebook.purchase;

import lombok.Builder;

@Builder
public record ReadingProgressResponse(
    Long bookId,
    Long userId,
    String userNickname,
    String userProfileImageURL,
    String cfi,
    long percentage
) { }