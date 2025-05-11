package qwerty.chaekit.dto.ebook.credit;

import lombok.Builder;
import qwerty.chaekit.domain.ebook.credit.CreditTransactionType;

import java.time.LocalDateTime;

@Builder
public record CreditTransactionResponse(
        String orderId,
        int productId,
        String productName,
        CreditTransactionType type,
        int creditAmount,
        int paymentAmount,
        String description,
        LocalDateTime approvedAt
) { }
