package qwerty.chaekit.dto.external.kakaopay;

public record KakaoPayCancelResponse(
        String tid,
        String status,
        String partner_order_id,
        String partner_user_id,
        String payment_method_type,
        Amount amount,
        ApprovedCancelAmount approved_cancel_amount,
        String canceled_at,
        String payload
) {
}
