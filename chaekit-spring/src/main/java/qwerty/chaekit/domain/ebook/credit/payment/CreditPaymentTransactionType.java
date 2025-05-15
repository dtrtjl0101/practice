package qwerty.chaekit.domain.ebook.credit.payment;

import lombok.Getter;

@Getter
public enum CreditPaymentTransactionType {
    CHARGE("충전"),
    REFUND("환불");

    private final String description;

    CreditPaymentTransactionType(String description) {
        this.description = description;
    }

}
