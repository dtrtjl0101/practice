package qwerty.chaekit.domain.ebook.credit;

public enum CreditUsageTransactionType {
    PURCHASE("구매"),
    REFUND("환불")
    ;

    private final String description;

    CreditUsageTransactionType(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
