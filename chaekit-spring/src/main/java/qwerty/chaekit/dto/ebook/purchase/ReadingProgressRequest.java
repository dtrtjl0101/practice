package qwerty.chaekit.dto.ebook.purchase;

public record ReadingProgressRequest(
    String cfi,
    Long percentage
) {}