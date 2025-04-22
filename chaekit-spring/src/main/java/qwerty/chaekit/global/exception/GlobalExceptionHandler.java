package qwerty.chaekit.global.exception;

import io.swagger.v3.oas.annotations.Hidden;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;
import qwerty.chaekit.global.enums.ErrorCode;
import qwerty.chaekit.global.response.ApiErrorResponse;

import java.util.stream.Collectors;

@Hidden
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {
    @ExceptionHandler(BadRequestException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiErrorResponse handleBadRequestException(BadRequestException ex) {
        return ApiErrorResponse.of(ex.getErrorCode(), ex.getMessage());
    }

    @ExceptionHandler(ForbiddenException.class)
    @ResponseStatus(HttpStatus.FORBIDDEN)
    public ApiErrorResponse handleNoSuchElementException(ForbiddenException ex) {
        return ApiErrorResponse.of(ex.getErrorCode(), ex.getMessage());
    }

    @ExceptionHandler(NotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ApiErrorResponse handleNoSuchElementException(NotFoundException ex) {
        return ApiErrorResponse.of(ex.getErrorCode(), ex.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiErrorResponse handleNoResourceFoundException(MethodArgumentNotValidException ex) {
        // @Valid 처리
        String message = ex.getBindingResult().getFieldErrors().stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .collect(Collectors.joining(", "));
        return ApiErrorResponse.of(ErrorCode.INVALID_INPUT.getCode(), message);
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    @ResponseStatus(HttpStatus.METHOD_NOT_ALLOWED)
    public ApiErrorResponse handleMethodNotSupportedException() {
        ErrorCode errorCode = ErrorCode.METHOD_NOT_ALLOWED;
        return ApiErrorResponse.of(errorCode.getCode(), errorCode.getMessage());
    }

    @ExceptionHandler(NoResourceFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ApiErrorResponse handleNoResourceFoundException() {
        ErrorCode errorCode = ErrorCode.NO_RESOURCE_FOUND;
        return ApiErrorResponse.of(errorCode.getCode(), errorCode.getMessage());
    }

    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ApiErrorResponse handleGenericException(Exception ex) {
        log.error("Unhandled exception occurred", ex);
        return ApiErrorResponse.of("500", "Internal Server Error: " + ex.getMessage());
    }
}