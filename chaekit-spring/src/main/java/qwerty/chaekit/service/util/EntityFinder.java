package qwerty.chaekit.service.util;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import qwerty.chaekit.domain.ebook.Ebook;
import qwerty.chaekit.domain.ebook.repository.EbookRepository;
import qwerty.chaekit.domain.group.ReadingGroup;
import qwerty.chaekit.domain.group.activity.Activity;
import qwerty.chaekit.domain.group.activity.repository.ActivityRepository;
import qwerty.chaekit.domain.group.repository.GroupRepository;
import qwerty.chaekit.domain.member.user.UserProfile;
import qwerty.chaekit.domain.member.user.UserProfileRepository;
import qwerty.chaekit.global.exception.NotFoundException;

import static qwerty.chaekit.global.enums.ErrorCode.*;

@Service
@RequiredArgsConstructor
public class EntityFinder {

    private final UserProfileRepository userRepository;
    private final EbookRepository ebookRepository;
    private final ActivityRepository activityRepository;
    private final GroupRepository groupRepository;

    public UserProfile findUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException(USER_NOT_FOUND));
    }

    public Ebook findEbook(Long id) {
        return ebookRepository.findById(id)
                .orElseThrow(() -> new NotFoundException(EBOOK_NOT_FOUND));
    }

    public Activity findActivity(Long id) {
        return activityRepository.findById(id)
                .orElseThrow(() -> new NotFoundException(ACTIVITY_NOT_FOUND));
    }

    public ReadingGroup findGroup(Long id) {
        return groupRepository.findById(id)
                .orElseThrow(() -> new NotFoundException(GROUP_NOT_FOUND));
    }
}