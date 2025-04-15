package qwerty.chaekit.global.exception;

import lombok.Getter;
import qwerty.chaekit.global.enums.ErrorCode;

@Getter
public class NotFoundException extends CustomException {
    public NotFoundException(ErrorCode errorCode) {
        super(errorCode);
    }
}
