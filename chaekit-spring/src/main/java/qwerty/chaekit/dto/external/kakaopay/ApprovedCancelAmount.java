package qwerty.chaekit.dto.external.kakaopay;

public record ApprovedCancelAmount(
        int total,
        int tax_free,
        int vat,
        int point,
        int discount,
        int green_deposit
) {}