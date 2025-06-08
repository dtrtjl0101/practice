package qwerty.chaekit.global.exception;

import lombok.Getter;
import qwerty.chaekit.global.enums.ErrorCode;

@Getter
public class BadRequestException extends CustomException {
    public BadRequestException(ErrorCode errorCode) {
        super(errorCode);
    }
}
