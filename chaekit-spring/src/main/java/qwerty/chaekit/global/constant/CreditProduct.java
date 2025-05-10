package qwerty.chaekit.global.constant;

import lombok.Getter;

import java.util.Arrays;

@Getter
public enum CreditProduct {
    CREDIT_2000("2000 크레딧", 1, 2000, 2000),
    CREDIT_3000("3000 크레딧", 2, 3000, 3000),
    CREDIT_5000("5000 크레딧", 3, 5000, 5000),
    CREDIT_10000("10000 크레딧", 4, 10000, 10000),
    CREDIT_30000("30000 크레딧", 5, 30000, 30000),
    CREDIT_50000("50000 크레딧", 6, 50000, 50000),
    ;

    public final String name;
    public final int id;
    public final int creditAmount;
    public final int price;

    CreditProduct(String name, int id, int creditAmount, int price) {
        this.name = name;
        this.id = id;
        this.creditAmount = creditAmount;
        this.price = price;
    }

    public static CreditProduct getCreditProduct(int id) {
        return Arrays.stream(CreditProduct.values())
                .filter(product -> product.id == id)
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Invalid credit product ID: " + id));
    }
}
