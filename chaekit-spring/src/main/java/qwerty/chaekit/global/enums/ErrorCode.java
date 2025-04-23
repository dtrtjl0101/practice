package qwerty.chaekit.global.enums;


import lombok.Getter;

@Getter
public enum ErrorCode {
    // BAD_REQUEST
    // book
    EBOOK_FILE_MISSING("EBOOK_FILE_MISSING", "파일이 누락되었습니다"),
    EBOOK_FILE_SIZE_EXCEEDED("EBOOK_FILE_SIZE_EXCEEDED", "파일 크기가 초과되었습니다"),
    INVALID_EBOOK_FILE("INVALID_EBOOK_FILE", "유효하지 않은 전자책 파일입니다"),
    // highlight
    BOOK_ID_REQUIRED("BOOK_ID_REQUIRED", "책 ID가 필요합니다"),
    // member
    MEMBER_ALREADY_EXISTS("MEMBER_ALREADY_EXISTS", "이미 존재하는 회원입니다"),
    PUBLISHER_ALREADY_EXISTS("PUBLISHER_ALREADY_EXISTS", "이미 존재하는 출판사 이름입니다"),
    NICKNAME_ALREADY_EXISTS("NICKNAME_ALREADY_EXISTS", "이미 존재하는 닉네임입니다"),
    // group
    ACTIVITY_TIME_CONFLICT("ACTIVITY_TIME_CONFLICT", "이미 등록된 독서모임 일정과 겹칩니다"),
    ACTIVITY_TIME_INVALID("ACTIVITY_TIME_INVALID", "시작일과 종료일이 올바르지 않습니다"),
    // email
    EMAIL_VERIFICATION_FAILED("EMAIL_VERIFICATION_FAILED", "이메일 인증에 실패했습니다."),
    EMAIL_SEND_FAILED("EMAIL_SEND_FAILED", "이메일 전송에 실패했습니다."),
    // file
    INVALID_EXTENSION("INVALID_EXTENSION", "허용되지 않는 확장자입니다"),
    FILE_SIZE_EXCEEDED("FILE_SIZE_EXCEED", "파일 크기가 초과되었습니다"),

    // FORBIDDEN
    NO_VALID_TOKEN("NO_VALID_TOKEN", "유효한 토큰이 없습니다"),
    GROUP_UPDATE_FORBIDDEN("GROUP_UPDATE_FORBIDDEN", "독서모임 수정 권한이 없습니다"),
    HIGHLIGHT_NOT_YOURS("HIGHLIGHT_NOT_YOURS", "하이라이트는 본인만 수정할 수 있습니다"),
    GROUP_LEADER_ONLY("GROUP_LEADER_ONLY", "모임지기만 사용할 수 있는 기능입니다"),
    ACTIVITY_GROUP_MISMATCH("ACTIVITY_GROUP_MISMATCH", "해당 독서모임의 활동이 아닙니다"),
    ONLY_USER("ONLY_USER", "일반 회원만 사용할 수 있는 기능입니다"),
    ONLY_PUBLISHER("ONLY_PUBLISHER", "출판사 회원만 사용할 수 있는 기능입니다"),
    ONLY_ADMIN("ONLY_ADMIN", "관리자만 사용할 수 있는 기능입니다"),

    // NOT_FOUND
    EBOOK_NOT_FOUND("EBOOK_NOT_FOUND", "해당 전자책이 존재하지 않습니다"),
    PUBLISHER_NOT_FOUND("PUBLISHER_NOT_FOUND", "해당 출판사가 존재하지 않습니다"),
    USER_NOT_FOUND("USER_NOT_FOUND", "일반 회원이 아니거나 존재하지 않습니다"),
    GROUP_NOT_FOUND("GROUP_NOT_FOUND", "해당 독서모임이 존재하지 않습니다"),
    HIGHLIGHT_NOT_FOUND("HIGHLIGHT_NOT_FOUND", "해당 하이라이트가 존재하지 않습니다"),
    ACTIVITY_NOT_FOUND("ACTIVITY_NOT_FOUND", "해당 활동이 존재하지 않습니다"),

    // Exception Handler
    INVALID_INPUT("INVALID_INPUT", "입력값이 유효하지 않습니다"),

    METHOD_NOT_ALLOWED("METHOD_NOT_ALLOWED", "지원하지 않는 HTTP 메서드입니다"),
    NO_RESOURCE_FOUND("NO_RESOURCE_FOUND", "존재하지 않는 경로입니다"),

    ALREADY_JOINED_GROUP("ALREADY_JOINED_GROUP", "이미 가입한 그룹입니다"),
    GROUP_LEADER_CANNOT_LEAVE("GROUP_LEADER_CANNOT_LEAVE", "그룹장은 그룹을 탈퇴할 수 없습니다");

    private final String code;
    private final String message;

    ErrorCode(String code, String message) {
        this.code = code;
        this.message = message;
    }

}
