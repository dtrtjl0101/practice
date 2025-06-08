package qwerty.chaekit.service.group;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import qwerty.chaekit.domain.ebook.Ebook;
import qwerty.chaekit.domain.group.ReadingGroup;
import qwerty.chaekit.domain.group.activity.Activity;
import qwerty.chaekit.domain.group.activity.activitymember.ActivityMember;
import qwerty.chaekit.domain.group.activity.activitymember.ActivityMemberRepository;
import qwerty.chaekit.domain.group.activity.repository.ActivityRepository;
import qwerty.chaekit.domain.member.user.UserProfile;
import qwerty.chaekit.dto.group.activity.ActivityFetchResponse;
import qwerty.chaekit.dto.group.activity.ActivityPatchRequest;
import qwerty.chaekit.dto.group.activity.ActivityPostRequest;
import qwerty.chaekit.dto.group.activity.ActivityPostResponse;
import qwerty.chaekit.dto.page.PageResponse;
import qwerty.chaekit.global.security.resolver.UserToken;
import qwerty.chaekit.service.ebook.EbookPolicy;
import qwerty.chaekit.service.util.EntityFinder;
import qwerty.chaekit.service.util.FileService;
import qwerty.chaekit.global.enums.ErrorCode;
import qwerty.chaekit.global.exception.ForbiddenException;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ActivityServiceTest {
    @InjectMocks
    private ActivityService activityService;

    @Mock
    private ActivityRepository activityRepository;
    @Mock
    private ActivityMemberRepository activityMemberRepository;
    @Mock
    private ActivityPolicy activityPolicy;
    @Mock
    private EbookPolicy ebookPolicy;
    @Mock
    private FileService fileService;
    @Mock
    private EntityFinder entityFinder;

    private UserProfile dummyUser(long userId) {
        return UserProfile.builder().id(userId).build();
    }

    private ReadingGroup dummyGroup(long groupId, UserProfile leader) {
        return ReadingGroup.builder().id(groupId).groupLeader(leader).build();
    }

    private Ebook dummyEbook(long bookId) {
        return Ebook.builder().id(bookId).build();
    }

    private UserToken dummyUserToken(long userId) {
        return UserToken.builder().userId(userId).build();
    }

    @Test
    void createActivity() {
        // given
        long userId = 1L;
        long groupId = 1L;
        long bookId = 1L;
        long createdActivityId = 1L;
        LocalDate startTime = LocalDate.parse("2025-04-01");
        LocalDate endTime = LocalDate.parse("2026-04-14");
        ActivityPostRequest postRequest = ActivityPostRequest.builder()
                .bookId(bookId)
                .startTime(startTime)
                .endTime(endTime)
                .build();

        UserToken userToken = dummyUserToken(userId);
        UserProfile leader = dummyUser(userId);
        ReadingGroup readingGroup = dummyGroup(groupId, leader);
        Ebook ebook = dummyEbook(bookId);

        Activity createdActivity = Activity.builder()
                .id(createdActivityId)
                .group(readingGroup)
                .startTime(startTime)
                .endTime(endTime)
                .book(ebook)
                .build();

        given(entityFinder.findUser(userId))
                .willReturn(leader);
        given(entityFinder.findGroup(groupId))
                .willReturn(readingGroup);
        given(entityFinder.findEbook(bookId))
                .willReturn(ebook);
        given(activityRepository.save(any(Activity.class)))
                .willReturn(createdActivity);

        // when
        ActivityPostResponse result = activityService.createActivity(userToken, groupId, postRequest);

        // then
        assertNotNull(result);
        assertEquals(createdActivityId, result.activityId());
        assertEquals(bookId, result.bookId());
        assertEquals(startTime, result.startTime());
        assertEquals(endTime, result.endTime());
    }

    @Test
    void updateActivity() {
        // given
        long userId = 1L;
        long groupId = 1L;
        long bookId = 1L;
        long activityId = 1L;
        LocalDate startTime = LocalDate.parse("2025-04-01");
        LocalDate endTime = LocalDate.parse("2026-04-14");
        String oldDescription = "Old description";
        LocalDate newStartTime = LocalDate.parse("2025-05-01");
        LocalDate newEndTime = LocalDate.parse("2025-06-01");
        String newDescription = "Updated description";

        ActivityPatchRequest patchRequest = ActivityPatchRequest.builder()
                .activityId(activityId)
                .startTime(newStartTime)
                .endTime(newEndTime)
                .description(newDescription)
                .build();

        UserToken userToken = dummyUserToken(userId);
        UserProfile leader = dummyUser(userId);
        ReadingGroup readingGroup = dummyGroup(groupId, leader);
        Ebook ebook = dummyEbook(bookId);

        Activity oldActivity = Activity.builder()
                .id(activityId)
                .group(readingGroup)
                .startTime(startTime)
                .endTime(endTime)
                .book(ebook)
                .description(oldDescription)
                .build();

        given(entityFinder.findUser(userId))
                .willReturn(leader);
        given(entityFinder.findGroup(groupId))
                .willReturn(readingGroup);
        given(entityFinder.findActivity(activityId))
                .willReturn(oldActivity);
        
        // when
        ActivityPostResponse result = activityService.updateActivity(userToken, groupId, patchRequest);

        // then
        assertNotNull(result);
        assertEquals(activityId, result.activityId());
        assertEquals(newStartTime, result.startTime());
        assertEquals(newEndTime, result.endTime());
        assertEquals(newDescription, result.description());
    }

    @Test
    void updateActivity_throwsIfNotLeader() {
        long userId = 1L;
        long groupId = 1L;
        long bookId = 1L;
        long activityId = 1L;
        LocalDate newStartTime = LocalDate.parse("2025-05-01");
        LocalDate newEndTime = LocalDate.parse("2025-06-01");
        String newDescription = "Updated description";

        ActivityPatchRequest patchRequest = ActivityPatchRequest.builder()
                .activityId(activityId)
                .startTime(newStartTime)
                .endTime(newEndTime)
                .description(newDescription)
                .build();

        UserToken userToken = dummyUserToken(userId);
        UserProfile notLeader = dummyUser(userId);
        ReadingGroup group = dummyGroup(groupId, dummyUser(999L)); // 리더가 아님
        Ebook ebook = dummyEbook(bookId);

        Activity activity = Activity.builder()
                .id(activityId)
                .group(group)
                .startTime(LocalDate.parse("2025-04-01"))
                .endTime(LocalDate.parse("2026-04-14"))
                .book(ebook)
                .description("Old description")
                .build();

        given(entityFinder.findUser(userId)).willReturn(notLeader);
        given(entityFinder.findGroup(groupId)).willReturn(group);
        given(entityFinder.findActivity(activityId)).willReturn(activity);

        ForbiddenException ex = assertThrows(
                ForbiddenException.class,
                () -> activityService.updateActivity(userToken, groupId, patchRequest)
        );
        assertEquals(ErrorCode.GROUP_LEADER_ONLY.getCode(), ex.getErrorCode());
    }

    @Test
    void updateActivity_throwsIfGroupMismatch() {
        long userId = 1L;
        long groupId = 1L;
        long bookId = 1L;
        long activityId = 1L;
        LocalDate newStartTime = LocalDate.parse("2025-05-01");
        LocalDate newEndTime = LocalDate.parse("2025-06-01");
        String newDescription = "Updated description";

        ActivityPatchRequest patchRequest = ActivityPatchRequest.builder()
                .activityId(activityId)
                .startTime(newStartTime)
                .endTime(newEndTime)
                .description(newDescription)
                .build();

        UserToken userToken = dummyUserToken(userId);
        UserProfile leader = dummyUser(userId);
        ReadingGroup group = dummyGroup(groupId, leader);
        ReadingGroup otherGroup = dummyGroup(999L, leader);
        Ebook ebook = dummyEbook(bookId);

        Activity activity = Activity.builder()
                .id(activityId)
                .group(otherGroup) // 다른 그룹
                .startTime(LocalDate.parse("2025-04-01"))
                .endTime(LocalDate.parse("2026-04-14"))
                .book(ebook)
                .description("Old description")
                .build();

        given(entityFinder.findUser(userId)).willReturn(leader);
        given(entityFinder.findGroup(groupId)).willReturn(group);
        given(entityFinder.findActivity(activityId)).willReturn(activity);

        ForbiddenException ex = assertThrows(
                ForbiddenException.class,
                () -> activityService.updateActivity(userToken, groupId, patchRequest)
        );
        assertEquals(ErrorCode.ACTIVITY_GROUP_MISMATCH.getCode(), ex.getErrorCode());
    }

    @Test
    void fetchAllActivities() {
        // given
        long userId = 1L;
        long groupId = 5L;
        
        UserToken userLogin = dummyUserToken(userId);
        Pageable pageable = PageRequest.of(0, 10);

        ReadingGroup readingGroup = dummyGroup(groupId, null);
        Ebook ebook = dummyEbook(2L);

        Activity activity1 = new Activity(1L, readingGroup, ebook, LocalDate.parse("2025-04-01"), LocalDate.parse("2026-04-14"), "Activity 1");
        Activity activity2 = new Activity(2L, readingGroup, ebook, LocalDate.parse("2025-04-15"), LocalDate.parse("2026-04-28"), "Activity 2");

        List<Activity> activityList = List.of(activity1, activity2);
        Page<Activity> page = new PageImpl<>(activityList);

        given(activityRepository.findByGroup_IdWithBook(groupId, pageable)).willReturn(page);

        // when
        PageResponse<ActivityFetchResponse> result = activityService.fetchAllActivities(userLogin, pageable, groupId);

        // then
        assertNotNull(result);
        assertEquals(2, result.content().size());
        assertEquals("Activity 1", result.content().get(0).description());
        assertEquals("Activity 2", result.content().get(1).description());
    }

    @Test
    void getMyActivities_withoutBookId() {
        long userId = 1L;
        UserToken userToken = dummyUserToken(userId);
        UserProfile user = dummyUser(userId);
        Activity activity = Activity.builder()
                .id(10L)
                .group(dummyGroup(5L, null))
                .book(dummyEbook(2L))
                .startTime(LocalDate.parse("2025-04-01"))
                .endTime(LocalDate.parse("2026-04-14"))
                .description("Test Activity")
                .build();
        ActivityMember member = ActivityMember.builder().activity(activity).user(user).build();
        Pageable pageable = PageRequest.of(0, 10);

        when(entityFinder.findUser(userId)).thenReturn(user);
        when(activityMemberRepository.findByUser(user, pageable))
                .thenReturn(new PageImpl<>(List.of(member)));
        when(fileService.convertToPublicImageURL(any())).thenReturn("img-url");

        PageResponse<ActivityFetchResponse> result = activityService.getMyActivities(userToken, null, pageable);

        assertNotNull(result);
        assertEquals(1, result.content().size());
        assertEquals(10L, result.content().get(0).activityId());
        assertEquals(5L, result.content().get(0).groupId());
        assertEquals(2L, result.content().get(0).bookId());
    }

    @Test
    void getMyActivities_withBookId() {
        long userId = 1L;
        long bookId = 2L;
        UserToken userToken = dummyUserToken(userId);
        UserProfile user = dummyUser(userId);
        Ebook ebook = dummyEbook(bookId);
        Activity activity = Activity.builder().id(11L).group(dummyGroup(5L, null)).book(ebook).build();
        ActivityMember member = ActivityMember.builder().activity(activity).user(user).build();
        Pageable pageable = PageRequest.of(0, 10);

        when(entityFinder.findUser(userId)).thenReturn(user);
        when(entityFinder.findEbook(bookId)).thenReturn(ebook);
        when(activityMemberRepository.findByUserAndActivity_Book(user, ebook, pageable))
                .thenReturn(new PageImpl<>(List.of(member)));
        when(fileService.convertToPublicImageURL(any())).thenReturn("img-url");

        PageResponse<ActivityFetchResponse> result = activityService.getMyActivities(userToken, bookId, pageable);

        assertNotNull(result);
        assertEquals(1, result.content().size());
        assertEquals(11L, result.content().get(0).activityId());
    }

    @Test
    void fetchActivity_success() {
        long userId = 1L;
        long activityId = 100L;
        UserToken userToken = dummyUserToken(userId);
        Ebook ebook = Ebook.builder().id(3L).coverImageKey("cover-key").build();
        Activity activity = Activity.builder().id(activityId).group(dummyGroup(5L, null)).book(ebook).build();

        when(activityRepository.findByIdWithBook(activityId)).thenReturn(Optional.of(activity));
        doNothing().when(activityPolicy).assertJoined(userId, activityId);
        when(fileService.convertToPublicImageURL("cover-key")).thenReturn("public-url");

        ActivityFetchResponse result = activityService.fetchActivity(userToken, activityId);

        assertNotNull(result);
        assertEquals(activityId, result.activityId());
    }

    @Test
    void joinActivity_success() {
        long userId = 1L;
        long activityId = 200L;
        UserToken userToken = dummyUserToken(userId);
        UserProfile user = dummyUser(userId);
        Activity activity = mock(Activity.class);

        when(entityFinder.findUser(userId)).thenReturn(user);
        when(entityFinder.findActivity(activityId)).thenReturn(activity);
        doNothing().when(activityPolicy).assertJoinable(user, activity);

        activityService.joinActivity(userToken, activityId);

        verify(activity).addParticipant(user);
    }

    @Test
    void leaveActivity_success() {
        long userId = 1L;
        long activityId = 300L;
        UserToken userToken = dummyUserToken(userId);
        UserProfile user = dummyUser(userId);
        Activity activity = mock(Activity.class);

        when(entityFinder.findUser(userId)).thenReturn(user);
        when(entityFinder.findActivity(activityId)).thenReturn(activity);
        when(activity.isParticipant(user)).thenReturn(true);

        activityService.leaveActivity(userToken, activityId);

        verify(activity).removeParticipant(user);
    }
}
