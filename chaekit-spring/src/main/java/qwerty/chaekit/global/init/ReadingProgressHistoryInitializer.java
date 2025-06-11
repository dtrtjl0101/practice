package qwerty.chaekit.global.init;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import qwerty.chaekit.domain.ebook.history.ReadingProgressHistory;
import qwerty.chaekit.domain.ebook.history.ReadingProgressHistoryRepository;
import qwerty.chaekit.domain.ebook.purchase.EbookPurchase;
import qwerty.chaekit.domain.ebook.purchase.repository.EbookPurchaseRepository;
import qwerty.chaekit.domain.group.activity.Activity;
import qwerty.chaekit.domain.group.activity.activitymember.ActivityMember;
import qwerty.chaekit.domain.group.activity.activitymember.ActivityMemberRepository;
import qwerty.chaekit.domain.group.activity.repository.ActivityRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Slf4j
@Component
@RequiredArgsConstructor
@Order(3)
public class ReadingProgressHistoryInitializer implements ApplicationRunner {

    private final ActivityRepository activityRepository;
    private final ActivityMemberRepository activityMemberRepository;
    private final EbookPurchaseRepository ebookPurchaseRepository;
    private final ReadingProgressHistoryRepository historyRepository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) throws Exception {
        LocalDate yesterday = LocalDate.now().minusDays(1);

        List<Activity> activeActivities = activityRepository
                .findByStartTimeLessThanEqualAndEndTimeGreaterThanEqual(yesterday, yesterday);

        for (Activity activity : activeActivities) {
            List<ActivityMember> members = activityMemberRepository.findByActivity(activity);

            for (ActivityMember member : members) {
                log.info("activityId: {}, userId: {}", member.getActivity().getId(), member.getUser().getId());
                boolean alreadyExists = historyRepository.existsByActivityAndUserAndCreatedAtBetween(
                        activity,
                        member.getUser(),
                        yesterday.plusDays(1).atStartOfDay(),
                        yesterday.plusDays(2).atStartOfDay()
                );

                if (!alreadyExists) {
                    Optional<EbookPurchase> purchaseOpt = ebookPurchaseRepository.findByUserAndEbook(
                            member.getUser(), activity.getBook());

                    long percentage = purchaseOpt.map(EbookPurchase::getPercentage).orElse(0L);

                    historyRepository.save(ReadingProgressHistory.builder()
                            .activity(activity)
                            .user(member.getUser())
                            .percentage(percentage)
                            .build());
                }
            }
        }
    }
}