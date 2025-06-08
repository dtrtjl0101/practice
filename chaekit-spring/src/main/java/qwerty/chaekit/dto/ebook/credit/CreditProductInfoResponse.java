package qwerty.chaekit.dto.ebook.credit;

import lombok.Builder;

@Builder
public record CreditProductInfoResponse(
        int id,
        int creditAmount,
        int price
) { }
