package qwerty.chaekit.global.exception;

import lombok.Getter;
import qwerty.chaekit.global.enums.ErrorCode;

@Getter
public class UnauthorizedException extends CustomException {
    public UnauthorizedException(ErrorCode errorCode) {
        super(errorCode);
    }
}
