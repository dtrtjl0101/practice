package qwerty.chaekit.service.statistics;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import qwerty.chaekit.domain.ebook.repository.EbookRepository;
import qwerty.chaekit.domain.group.activity.repository.ActivityRepository;
import qwerty.chaekit.domain.group.repository.GroupRepository;
import qwerty.chaekit.domain.member.user.UserProfileRepository;
import qwerty.chaekit.dto.statistics.MainStatisticResponse;

import java.time.LocalDateTime;

@Service
@Transactional
@RequiredArgsConstructor
public class StatisticsService {
    private final ActivityRepository activityRepository;
    private final EbookRepository ebookRepository;
    private final UserProfileRepository userProfileRepository;
    private final GroupRepository groupRepository;

    public MainStatisticResponse getMainStatistics() {
        long totalGroups = groupRepository.count();
        long totalUsers = userProfileRepository.count();
        long totalEbooks = ebookRepository.count();
        long totalActivities = activityRepository.count();
        long increasedActivities = activityRepository.countByCreatedAtAfter(LocalDateTime.now().minusMonths(1));

        return new MainStatisticResponse(
            totalGroups,
            totalUsers,
            totalEbooks,
            totalActivities,
            increasedActivities
        );
    }
}
