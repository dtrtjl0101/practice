package qwerty.chaekit.integration;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import qwerty.chaekit.domain.ebook.Ebook;
import qwerty.chaekit.domain.group.ReadingGroup;
import qwerty.chaekit.domain.group.activity.Activity;
import qwerty.chaekit.domain.group.activity.repository.ActivityRepository;
import qwerty.chaekit.domain.member.user.UserProfile;
import qwerty.chaekit.dto.group.activity.ActivityFetchResponse;
import qwerty.chaekit.dto.group.activity.ActivityPatchRequest;
import qwerty.chaekit.dto.group.activity.ActivityPostRequest;
import qwerty.chaekit.dto.group.activity.ActivityPostResponse;
import qwerty.chaekit.dto.page.PageResponse;
import qwerty.chaekit.global.exception.BadRequestException;
import qwerty.chaekit.global.exception.ForbiddenException;
import qwerty.chaekit.global.security.resolver.UserToken;
import qwerty.chaekit.service.group.ActivityService;
import qwerty.chaekit.util.TestFixtureFactory;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

@ActiveProfiles("test")
@SpringBootTest
@Transactional
class ActivityServiceTest {

    @Autowired
    private ActivityService activityService;

    @Autowired
    private ActivityRepository activityRepository;

    @Autowired
    private TestFixtureFactory testFixtureFactory;

    private UserToken groupLeaderLogin;
    private UserToken anotherLogin;
    private ReadingGroup dummyGroup;
    private Ebook dummyEbook;

    @BeforeEach
    void setUp() {
        UserProfile groupLeader = testFixtureFactory.createUser("leader_email", "leader_nickname");
        UserProfile anotherUser = testFixtureFactory.createUser("user_email", "user_nickname");
        groupLeaderLogin = testFixtureFactory.createUserToken(groupLeader.getMember(), groupLeader);
        anotherLogin = testFixtureFactory.createUserToken(anotherUser.getMember(), anotherUser);

        //PublisherProfile publisher = testFixtureFactory.createPublisher("publisher_email", "publisher_name");
        dummyEbook = testFixtureFactory.createEbook("dummy_ebook", "author", "description", "file_key");
        dummyGroup = testFixtureFactory.createGroup("dummy_group", groupLeader);

        testFixtureFactory.createEbookPurchase(groupLeader, dummyEbook);
    }

    @Test
    @DisplayName("활동 생성 테스트")
    void createActivityTest() {
        // Given
        ActivityPostRequest request = ActivityPostRequest.builder()
                .bookId(dummyEbook.getId())
                .startTime(LocalDate.now())
                .endTime(LocalDate.now().plusDays(5))
                .description("Test Activity")
                .build();

        // When
        ActivityPostResponse response = activityService.createActivity(groupLeaderLogin, dummyGroup.getId(), request);

        // Then
        assertThat(response).isNotNull();
        assertThat(response.description()).isEqualTo("Test Activity");
    }

    @Test
    @DisplayName("활동 생성 시 시간 겹침 예외 테스트")
    void createActivityTimeConflictTest() {
        // Given
        activityRepository.save(Activity.builder()
                .group(dummyGroup)
                .book(dummyEbook)
                .startTime(LocalDate.now())
                .endTime(LocalDate.now().plusDays(1))
                .description("Existing Activity")
                .build());

        ActivityPostRequest request = ActivityPostRequest.builder()
                .bookId(dummyEbook.getId())
                .startTime(LocalDate.now().plusDays(1))
                .endTime(LocalDate.now().plusDays(2))
                .description("Conflicting Activity")
                .build();

        // When & Then
        assertThrows(BadRequestException.class, () -> activityService.createActivity(groupLeaderLogin, dummyGroup.getId(), request));
    }

    @Test
    @DisplayName("활동 생성 시 모임장이 아닌 경우 예외 테스트")
    void createActivityForbiddenTest() {
        // Given
        ActivityPostRequest request = ActivityPostRequest.builder()
                .bookId(dummyEbook.getId())
                .startTime(LocalDate.now())
                .endTime(LocalDate.now().plusDays(1))
                .description("Test Activity")
                .build();

        // When & Then
        assertThrows(ForbiddenException.class, () -> activityService.createActivity(anotherLogin, dummyGroup.getId(), request));
    }

    @Test
    @DisplayName("활동 수정 테스트")
    void updateActivityTest() {
        // Given
        Activity activity = activityRepository.save(Activity.builder()
                .group(dummyGroup)
                .book(dummyEbook)
                .startTime(LocalDate.now())
                .endTime(LocalDate.now().plusDays(1))
                .description("Old Description")
                .build());

        ActivityPatchRequest request = ActivityPatchRequest.builder()
                .activityId(activity.getId())
                .description("Updated Description")
                .build();

        // When
        ActivityPostResponse response = activityService.updateActivity(groupLeaderLogin, dummyGroup.getId(), request);

        // Then
        assertThat(response).isNotNull();
        assertThat(response.description()).isEqualTo("Updated Description");
    }

    @Test
    @DisplayName("활동 수정 시 시간 겹침 예외 테스트")
    void updateActivityTimeConflictTest() {
        // Given
        activityRepository.save(Activity.builder()
                .group(dummyGroup)
                .book(dummyEbook)
                .startTime(LocalDate.now())
                .endTime(LocalDate.now().plusDays(1))
                .description("Existing Activity")
                .build());

        Activity activity = activityRepository.save(Activity.builder()
                .group(dummyGroup)
                .book(dummyEbook)
                .startTime(LocalDate.now().plusDays(2))
                .endTime(LocalDate.now().plusDays(3))
                .description("Activity to Update")
                .build());

        ActivityPatchRequest request = ActivityPatchRequest.builder()
                .activityId(activity.getId())
                .startTime(LocalDate.now())
                .endTime(LocalDate.now().plusDays(1))
                .build();

        // When & Then
        assertThrows(BadRequestException.class, () -> activityService.updateActivity(groupLeaderLogin, dummyGroup.getId(), request));
    }

    @Test
    @DisplayName("활동 조회 테스트")
    void fetchAllActivitiesTest() {
        // Given
        activityRepository.save(Activity.builder()
                .group(dummyGroup)
                .book(dummyEbook)
                .startTime(LocalDate.now())
                .endTime(LocalDate.now().plusDays(1))
                .description("Activity 1")
                .build());

        Pageable pageable = PageRequest.of(0, 10);

        // When
        PageResponse<ActivityFetchResponse> response = activityService.fetchAllActivities(groupLeaderLogin, pageable, dummyGroup.getId());

        // Then
        assertThat(response).isNotNull();
        assertThat(response.content()).hasSize(1);
        assertThat(response.content().get(0).description()).isEqualTo("Activity 1");
    }
}
