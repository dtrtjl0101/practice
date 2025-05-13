package qwerty.chaekit.dto.external.kakaopay;

public record KakaoPayReadyResponse(
        String tid,
        String next_redirect_pc_url
) { }
