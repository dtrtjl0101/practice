package qwerty.chaekit.global.response;

public record ApiErrorResponse(
        boolean isSuccessful,
        String errorCode,
        String errorMessage
) {
    public static ApiErrorResponse of(String errorCode, String errorMessage) {
        return new ApiErrorResponse(false, errorCode, errorMessage);
    }
}