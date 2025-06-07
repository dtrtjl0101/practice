package qwerty.chaekit.service.statistics;

import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import qwerty.chaekit.domain.ebook.history.ReadingProgressHistory;
import qwerty.chaekit.domain.ebook.history.ReadingProgressHistoryRepository;
import qwerty.chaekit.domain.ebook.purchase.EbookPurchase;
import qwerty.chaekit.domain.ebook.purchase.repository.EbookPurchaseRepository;
import qwerty.chaekit.domain.group.activity.Activity;
import qwerty.chaekit.domain.group.activity.activitymember.ActivityMember;
import qwerty.chaekit.domain.group.activity.activitymember.ActivityMemberRepository;
import qwerty.chaekit.domain.group.activity.repository.ActivityRepository;
import qwerty.chaekit.domain.member.user.UserProfile;
import qwerty.chaekit.dto.statistics.ReadingProgressHistoryResponse;
import qwerty.chaekit.global.enums.ErrorCode;
import qwerty.chaekit.global.exception.ForbiddenException;
import qwerty.chaekit.global.security.resolver.UserToken;
import qwerty.chaekit.service.group.ActivityPolicy;
import qwerty.chaekit.service.util.EntityFinder;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ReadingProgressHistoryService {
    private final ActivityRepository activityRepository;
    private final ActivityMemberRepository activityMemberRepository;
    private final EbookPurchaseRepository ebookPurchaseRepository;
    private final ReadingProgressHistoryRepository historyRepository;
    private final ActivityPolicy activityPolicy;
    private final EntityFinder entityFinder;

    @Scheduled(cron = "0 0 0 * * *")
    public void snapshotDailyProgress() {
        LocalDate yesterday = LocalDate.now().minusDays(1);
        List<Activity> activities = activityRepository
                .findByStartTimeLessThanEqualAndEndTimeGreaterThanEqual(yesterday, yesterday);

        for (Activity activity : activities) {
            List<ActivityMember> members = activityMemberRepository.findByActivity(activity);
            for (ActivityMember member : members) {
                Optional<EbookPurchase> purchaseOpt = ebookPurchaseRepository
                        .findByUserAndEbook(member.getUser(), activity.getBook());
                long percentage = purchaseOpt.map(EbookPurchase::getPercentage).orElse(0L);
                historyRepository.save(ReadingProgressHistory.builder()
                        .activity(activity)
                        .user(member.getUser())
                        .percentage(percentage)
                        .build());
            }
        }
    }

    @Transactional(readOnly = true)
    public List<ReadingProgressHistoryResponse> getHistory(UserToken token, Long activityId) {
        UserProfile user = entityFinder.findUser(token.userId());
        Activity activity = entityFinder.findActivity(activityId);
        
        activityPolicy.assertJoined(user, activity);
        ActivityMember membership = activityMemberRepository
                .findByUserAndActivity(user, activity)
                .orElseThrow(() -> new ForbiddenException(ErrorCode.ACTIVITY_MEMBER_ONLY));
        LocalDate joinDate = membership.getCreatedAt().toLocalDate();

        LocalDate start = activity.getStartTime();
        LocalDate end = activity.getEndTime();

        List<ReadingProgressHistory> histories = historyRepository
                .findByActivityAndCreatedAtBetween(activity,
                        start.atStartOfDay(), end.plusDays(1).atStartOfDay());

        Map<LocalDate, List<ReadingProgressHistory>> map = histories.stream()
                .collect(Collectors.groupingBy(h -> h.getCreatedAt().toLocalDate().minusDays(1)));

        List<LocalDate> days = start.datesUntil(end.plusDays(1)).toList();
        List<ReadingProgressHistoryResponse> responses = new ArrayList<>();
        for (LocalDate day : days) {
            List<ReadingProgressHistory> daily = map.getOrDefault(day, Collections.emptyList());
            double avg = daily.stream().mapToLong(ReadingProgressHistory::getPercentage).average().orElse(0.0);
            long my = daily.stream()
                    .filter(h -> h.getUser().getId().equals(user.getId()))
                    .mapToLong(ReadingProgressHistory::getPercentage)
                    .findFirst()
                    .orElse(0L);
            if (day.isBefore(joinDate)) {
                my = 0L;
            }
            responses.add(ReadingProgressHistoryResponse.builder()
                    .date(day)
                    .myPercentage(my)
                    .averagePercentage(avg)
                    .build());
        }
        return responses;
    }
}