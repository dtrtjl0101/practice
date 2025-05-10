package qwerty.chaekit.dto.ebook.credit.payment;

import lombok.Builder;

import java.time.LocalDateTime;

@Builder
public record CreditPaymentApproveResponse(
        String tid,
        String paymentMethod,
        Integer amount,
        LocalDateTime approvedAt
) { }
