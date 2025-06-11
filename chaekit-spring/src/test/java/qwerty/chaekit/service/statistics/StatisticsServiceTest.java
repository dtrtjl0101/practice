package qwerty.chaekit.service.statistics;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import qwerty.chaekit.domain.ebook.repository.EbookRepository;
import qwerty.chaekit.domain.group.activity.repository.ActivityRepository;
import qwerty.chaekit.domain.group.repository.GroupRepository;
import qwerty.chaekit.domain.member.user.UserProfileRepository;
import qwerty.chaekit.dto.statistics.MainStatisticResponse;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class StatisticsServiceTest {

    @InjectMocks
    private StatisticsService statisticsService;

    @Mock
    private ActivityRepository activityRepository;
    @Mock
    private EbookRepository ebookRepository;
    @Mock
    private UserProfileRepository userProfileRepository;
    @Mock
    private GroupRepository groupRepository;

    @Test
    void getMainStatistics_성공() {
        // given
        long totalGroups = 10L;
        long totalUsers = 100L;
        long totalEbooks = 50L;
        long totalActivities = 30L;
        long increasedActivities = 5L;

        // when
        when(groupRepository.count()).thenReturn(totalGroups);
        when(userProfileRepository.count()).thenReturn(totalUsers);
        when(ebookRepository.count()).thenReturn(totalEbooks);
        when(activityRepository.count()).thenReturn(totalActivities);
        when(activityRepository.countByCreatedAtAfter(any(LocalDateTime.class)))
                .thenReturn(increasedActivities);

        MainStatisticResponse result = statisticsService.getMainStatistics();

        // then
        assertThat(result.totalGroups()).isEqualTo(totalGroups);
        assertThat(result.totalUsers()).isEqualTo(totalUsers);
        assertThat(result.totalEbooks()).isEqualTo(totalEbooks);
        assertThat(result.totalActivities()).isEqualTo(totalActivities);
        assertThat(result.increasedActivities()).isEqualTo(increasedActivities);
    }
} 