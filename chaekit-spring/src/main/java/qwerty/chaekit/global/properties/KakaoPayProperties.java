package qwerty.chaekit.global.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "kakaopay")
public record KakaoPayProperties(
        String redirectBaseUrl,
        String cid,
        String secretKey
) { }
