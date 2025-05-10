package qwerty.chaekit.dto.ebook.credit.payment;

import lombok.Builder;

import java.time.LocalDateTime;

@Builder
public record CreditPaymentApproveResponse(
        String orderId,
        int creditProductId,
        String creditProductName,
        String paymentMethod,
        int paymentAmount,
        LocalDateTime approvedAt
) { }
