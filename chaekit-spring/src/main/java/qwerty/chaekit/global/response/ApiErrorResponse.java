package qwerty.chaekit.global.response;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "공통 에러 응답")
public record ApiErrorResponse(
        @Schema(description = "요청 성공 여부", example = "false")
        boolean isSuccessful,

        @Schema(description = "에러 코드", example = "EXPIRED_ACCESS_TOKEN")
        String errorCode,

        @Schema(description = "에러 메시지", example = "Access Token이 만료되었습니다")
        String errorMessage
) {
    public static ApiErrorResponse of(String errorCode, String errorMessage) {
        return new ApiErrorResponse(false, errorCode, errorMessage);
    }
}