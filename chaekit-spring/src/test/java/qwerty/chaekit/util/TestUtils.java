package qwerty.chaekit.util;

import qwerty.chaekit.domain.member.enums.Role;
import qwerty.chaekit.global.security.resolver.LoginMember;

public class TestUtils {
    public static LoginMember createLoginMember(Long memberId) {
        return new LoginMember(memberId, "test-username", Role.ROLE_USER.name());
    }
}
