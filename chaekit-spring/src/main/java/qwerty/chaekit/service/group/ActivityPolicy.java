package qwerty.chaekit.service.group;

import jakarta.annotation.Nullable;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import qwerty.chaekit.domain.ebook.purchase.repository.EbookPurchaseRepository;
import qwerty.chaekit.domain.group.activity.Activity;
import qwerty.chaekit.domain.group.activity.activitymember.ActivityMemberRepository;
import qwerty.chaekit.domain.group.activity.repository.ActivityRepository;
import qwerty.chaekit.domain.group.groupmember.GroupMemberRepository;
import qwerty.chaekit.domain.member.user.UserProfile;
import qwerty.chaekit.global.enums.ErrorCode;
import qwerty.chaekit.global.exception.BadRequestException;
import qwerty.chaekit.global.exception.ForbiddenException;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class ActivityPolicy {
    private final ActivityRepository activityRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final ActivityMemberRepository activityMemberRepository;
    private final EbookPurchaseRepository ebookPurchaseRepository;

    public void assertJoinable(UserProfile user, Activity activity) {
        groupMemberRepository.findByUserAndReadingGroupAndAcceptedTrue(user, activity.getGroup())
                .orElseThrow(() -> new BadRequestException(ErrorCode.GROUP_MEMBER_ONLY));

        if (activityMemberRepository.existsByUserAndActivity(user, activity)) {
            throw new BadRequestException(ErrorCode.ACTIVITY_ALREADY_JOINED);
        }

        if (activity.isEnded()) {
            throw new BadRequestException(ErrorCode.ACTIVITY_ALREADY_ENDED);
        }

        if (!ebookPurchaseRepository.existsByUserIdAndEbookId(user.getId(), activity.getBook().getId())) {
            throw new BadRequestException(ErrorCode.ACTIVITY_BOOK_NOT_OWNED);
        }
    }

    public void assertActivityPeriodValid(long groupId, @Nullable Long activityId, LocalDate startTime, LocalDate endTime) {
        if (startTime.isAfter(endTime)) {
            throw new BadRequestException(ErrorCode.ACTIVITY_TIME_INVALID);
        }

        activityRepository.findByGroup_Id(groupId).stream()
                .filter(a -> !a.getId().equals(activityId))
                .forEach(a -> {
                    boolean isBefore = endTime.isBefore(a.getStartTime());
                    boolean isAfter = startTime.isAfter(a.getEndTime());
                    if (!(isBefore || isAfter)) {
                        throw new BadRequestException(ErrorCode.ACTIVITY_TIME_CONFLICT);
                    }
                });
    }
    
    public void assertJoined(UserProfile user, Activity activity) {
        if (user.getId() == null || !activityMemberRepository.existsByUserAndActivity(user, activity)) {
            throw new ForbiddenException(ErrorCode.ACTIVITY_MEMBER_ONLY);
        }
    }

    public void assertJoined(Long userId, Long activityId) {
        UserProfile user = UserProfile.builder().id(userId).build();
        Activity activity = Activity.builder().id(activityId).build();
        assertJoined(user, activity);
    }
    
}
