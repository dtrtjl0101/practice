package qwerty.chaekit.dto.ebook.credit;

import lombok.Builder;
import qwerty.chaekit.domain.ebook.credit.CreditTransactionType;

import java.time.LocalDateTime;

@Builder
public record CreditTransactionResponse(
        CreditTransactionType type,
        Integer amount,
        String description,
        LocalDateTime createdAt
) { }
