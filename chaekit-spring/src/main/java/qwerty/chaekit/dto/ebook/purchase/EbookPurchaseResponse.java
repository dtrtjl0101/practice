package qwerty.chaekit.dto.ebook.purchase;

import lombok.Builder;
import qwerty.chaekit.domain.ebook.Ebook;
import qwerty.chaekit.domain.ebook.credit.usage.CreditUsageTransaction;

@Builder
public record EbookPurchaseResponse(
        Long userId,
        Long transactionId,
        int creditAmount,
        Long bookId,
        String title,
        String author,

        String presignedDownloadURL
) {
    /**
     * Creates an EbookPurchaseResponse from the given parameters.
     * 
     * JPA Fetch Requirements:
     * - `transaction`: Should contain valid credit usage details.
     */
    public static EbookPurchaseResponse of(
            Long userId,
            Ebook ebook,
            CreditUsageTransaction transaction,
            String presignedDownloadURL
    ) {
        return EbookPurchaseResponse.builder()
                .userId(userId)
                .transactionId(transaction.getId())
                .creditAmount(transaction.getCreditAmount())
                .bookId(ebook.getId())
                .title(ebook.getTitle())
                .author(ebook.getAuthor())
                .presignedDownloadURL(presignedDownloadURL)
                .build();
    }
}

