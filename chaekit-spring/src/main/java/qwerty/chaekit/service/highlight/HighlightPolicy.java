package qwerty.chaekit.service.highlight;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import qwerty.chaekit.domain.highlight.Highlight;
import qwerty.chaekit.domain.member.user.UserProfile;
import qwerty.chaekit.global.enums.ErrorCode;
import qwerty.chaekit.global.exception.ForbiddenException;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class HighlightPolicy {
    public void assertUpdatable(UserProfile user, Highlight highlight) {
        if(!highlight.isAuthor(user)) {
            throw new ForbiddenException(ErrorCode.HIGHLIGHT_NOT_YOURS);
        }

        if (highlight.isPublic()) {
            throw new ForbiddenException(ErrorCode.HIGHLIGHT_ALREADY_PUBLIC);
        }
    }

    public void assertUpdatable(Long userId, Highlight highlight) {
        UserProfile user = UserProfile.builder().id(userId).build();
        assertUpdatable(user, highlight);
    }
}
