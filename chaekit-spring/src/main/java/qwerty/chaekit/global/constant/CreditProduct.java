package qwerty.chaekit.global.constant;

import lombok.Getter;

@Getter
public enum CreditProduct {
    CREDIT_2000(1, 2000, 2000),
    CREDIT_3000(2, 3000, 3000),
    CREDIT_5000(3, 5000, 5000),
    CREDIT_10000(4, 10000, 10000),
    CREDIT_30000(6, 30000, 30000),
    CREDIT_50000(7, 50000, 50000),
    ;

    public final int id;
    public final int creditAmount;
    public final int price;

    CreditProduct(int id, int creditAmount, int price) {
        this.id = id;
        this.creditAmount = creditAmount;
        this.price = price;
    }
}
