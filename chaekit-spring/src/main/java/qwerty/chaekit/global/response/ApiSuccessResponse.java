package qwerty.chaekit.global.response;

public record ApiSuccessResponse<T>(
        boolean isSuccessful,
        T data
) {
    public static <T> ApiSuccessResponse<T> of(T data) {
        return new ApiSuccessResponse<>(true, data);
    }
    public static ApiSuccessResponse<Void> empty() {
        return new ApiSuccessResponse<>(true, null);
    }
}
