package qwerty.chaekit.dto.ebook.credit.payment;

import lombok.Builder;

@Builder
public record CreditPaymentReadyRequest(
        Long creditProductId
) { }
