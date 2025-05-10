package qwerty.chaekit.dto.external.kakaopay;

import java.time.LocalDateTime;

public record KakaoPayApproveResponse(
        String tid,
        String partner_order_id,
        String partner_user_id,
        String payment_method_type,
        Amount amount,
        ApprovedCancelAmount approved_cancel_amount,
        String item_name,
        String item_code,
        int quantity,
        LocalDateTime created_at,
        LocalDateTime approved_at
) { }