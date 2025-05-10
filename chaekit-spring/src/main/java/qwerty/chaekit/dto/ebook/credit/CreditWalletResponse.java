package qwerty.chaekit.dto.ebook.credit;

import lombok.Builder;

@Builder
public record CreditWalletResponse(
        Long walletId,
        Integer balance
) { }
