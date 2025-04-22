package qwerty.chaekit.global.exception;

import lombok.Getter;
import qwerty.chaekit.global.enums.ErrorCode;

@Getter
public class ForbiddenException extends CustomException {
    public ForbiddenException(ErrorCode errorCode) {
        super(errorCode);
    }
}
