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
        List<LocalDate> days = start.datesUntil(end.plusDays(1)).toList();

        List<ReadingProgressHistory> histories = historyRepository
                .findByActivityAndCreatedAtBetween(activity,
                        start.atStartOfDay(), end.plusDays(1).atStartOfDay());

        // 사용자별로 그룹화 후, 날짜별로 정렬
        Map<Long, List<ReadingProgressHistory>> historiesByUser = histories.stream()
                .collect(Collectors.groupingBy(h -> h.getUser().getId()));
        
        // 현재 실시간 진행률
        List<ActivityMember> activityMembers = activityMemberRepository.findByActivity(activity);
        List<Long> userIdList = activityMembers.stream()
                .map(activityMember -> activityMember.getUser().getId()).toList();
        Map<Long, Long> currentPercentageByUser = ebookPurchaseRepository.findByUserIdInAndEbook(userIdList, activity.getBook())
                .stream().collect(
                        Collectors.toMap(
                                ep -> ep.getUser().getId(),
                                EbookPurchase::getPercentage
                        )
                );

        // 사용자별 보정된 진행률 시계열 생성 (날짜별 최대 진행률 유지)
        Map<Long, Map<LocalDate, Long>> fixedProgressByUser = new HashMap<>();
        for (Long userId : userIdList) {
            List<ReadingProgressHistory> userHistories = historiesByUser.getOrDefault(userId, Collections.emptyList());

            Map<LocalDate, Long> rawByDate = userHistories.stream()
                    .collect(Collectors.toMap(
                            h -> h.getCreatedAt().toLocalDate(),
                            ReadingProgressHistory::getPercentage,
                            Math::max
                    ));

            Map<LocalDate, Long> progressMap = new LinkedHashMap<>();
            long maxSoFar = 0L;
            for (LocalDate day : days) {
                long p;
                if (day.equals(LocalDate.now())) {
                    p = currentPercentageByUser.getOrDefault(userId, 0L);
                } else {
                    p = rawByDate.getOrDefault(day, 0L);
                }
                maxSoFar = Math.max(maxSoFar, p);
                progressMap.put(day, maxSoFar);
            }
            fixedProgressByUser.put(userId, progressMap);
        }

        // 날짜별 평균 계산 + 내 진행률 보정
        List<ReadingProgressHistoryResponse> responses = new ArrayList<>();
        long myMax = 0L;

        for (LocalDate day : days) {
            List<Long> progresses = new ArrayList<>();
            long myProgress = 0L;

            for (Map.Entry<Long, Map<LocalDate, Long>> entry : fixedProgressByUser.entrySet()) {
                Long userId = entry.getKey();
                Long p = entry.getValue().getOrDefault(day, 0L);

                progresses.add(p);

                if (userId.equals(user.getId())) {
                    myProgress = day.isBefore(joinDate) ? 0L : p;
                }
            }

            myMax = Math.max(myMax, myProgress);
            double avg = progresses.stream().mapToLong(Long::longValue).average().orElse(0.0);

            responses.add(ReadingProgressHistoryResponse.builder()
                    .date(day)
                    .myPercentage(myMax)
                    .averagePercentage(avg)
                    .build());
        }

        return responses;
    }
}