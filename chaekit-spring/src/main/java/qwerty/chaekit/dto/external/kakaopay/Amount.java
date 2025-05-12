package qwerty.chaekit.dto.external.kakaopay;

public record Amount(
        int total,
        int tax_free,
        int vat,
        int point,
        int discount
) {}