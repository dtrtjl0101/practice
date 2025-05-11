package qwerty.chaekit.domain.ebook.credit;

import lombok.Getter;

@Getter
public enum CreditTransactionType {
    CHARGE("충전"),
    USE("사용"),
    REFUND("환불");

    private final String description;

    CreditTransactionType(String description) {
        this.description = description;
    }

}
