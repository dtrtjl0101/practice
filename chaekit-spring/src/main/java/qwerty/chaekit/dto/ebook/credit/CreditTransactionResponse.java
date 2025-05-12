package qwerty.chaekit.dto.ebook.credit;

import lombok.Builder;
import qwerty.chaekit.domain.ebook.credit.CreditPaymentTransactionType;

import java.time.LocalDateTime;

@Builder
public record CreditTransactionResponse(
        String orderId,
        int productId,
        String productName,
        CreditPaymentTransactionType type,
        int creditAmount,
        int paymentAmount,
        String description,
        LocalDateTime approvedAt
) { }
