package qwerty.chaekit.service.group;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import qwerty.chaekit.domain.ebook.Ebook;
import qwerty.chaekit.domain.group.ReadingGroup;
import qwerty.chaekit.domain.group.activity.Activity;
import qwerty.chaekit.domain.group.activity.activitymember.ActivityMemberRepository;
import qwerty.chaekit.domain.group.activity.repository.ActivityRepository;
import qwerty.chaekit.domain.group.groupmember.GroupMember;
import qwerty.chaekit.domain.group.groupmember.GroupMemberRepository;
import qwerty.chaekit.domain.member.Member;
import qwerty.chaekit.domain.member.enums.Role;
import qwerty.chaekit.domain.member.user.UserProfile;
import qwerty.chaekit.global.exception.BadRequestException;
import qwerty.chaekit.service.ebook.EbookPolicy;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.ArgumentMatchers.refEq;

@ExtendWith(MockitoExtension.class)
class ActivityPolicyTest {
    @InjectMocks
    private ActivityPolicy activityPolicy;

    @Mock
    private ActivityRepository activityRepository;
    @Mock
    private GroupMemberRepository groupMemberRepository;
    @Mock
    private ActivityMemberRepository activityMemberRepository;
    @Mock
    private EbookPolicy ebookPolicy;

    @Test
    void assertJoinable_success() {
        UserProfile user = UserProfile.builder()
                .id(1L)
                .member(Member.builder().id(1L).email("a@b.c").password("p").role(Role.ROLE_USER).build())
                .nickname("user")
                .build();
        ReadingGroup group = ReadingGroup.builder()
                .id(10L)
                .name("g")
                .groupLeader(UserProfile.builder().id(2L).member(Member.builder().id(2L).email("l@b.c").password("p").role(Role.ROLE_USER).build()).nickname("leader").build())
                .isAutoApproval(true)
                .build();
        Ebook ebook = Ebook.builder().id(3L).build();
        Activity activity = Activity.builder()
                .id(5L)
                .group(group)
                .book(ebook)
                .startTime(LocalDate.now())
                .endTime(LocalDate.now().plusDays(2))
                .build();

        when(groupMemberRepository.findByUserAndReadingGroupAndAcceptedTrue(user, group))
                .thenReturn(Optional.of(new GroupMember(group, user)));
        when(activityMemberRepository.existsByUserAndActivity(user, activity)).thenReturn(false);

        assertDoesNotThrow(() -> activityPolicy.assertJoinable(user, activity));
        verify(ebookPolicy).assertEBookPurchased(user, ebook);
    }

    @Test
    void assertJoinable_notMember() {
        UserProfile user = UserProfile.builder().id(1L).build();
        ReadingGroup group = ReadingGroup.builder().id(10L).groupLeader(UserProfile.builder().id(2L).build()).isAutoApproval(true).build();
        Activity activity = Activity.builder()
                .id(5L)
                .group(group)
                .book(Ebook.builder().id(3L).build())
                .startTime(LocalDate.now())
                .endTime(LocalDate.now().plusDays(1))
                .build();

        when(groupMemberRepository.findByUserAndReadingGroupAndAcceptedTrue(user, group))
                .thenReturn(Optional.empty());

        assertThrows(BadRequestException.class, () -> activityPolicy.assertJoinable(user, activity));
    }

    @Test
    void assertJoinable_alreadyJoined() {
        UserProfile user = UserProfile.builder().id(1L).build();
        ReadingGroup group = ReadingGroup.builder().id(10L).groupLeader(UserProfile.builder().id(2L).build()).isAutoApproval(true).build();
        Activity activity = Activity.builder()
                .id(5L)
                .group(group)
                .book(Ebook.builder().id(3L).build())
                .startTime(LocalDate.now())
                .endTime(LocalDate.now().plusDays(1))
                .build();

        when(groupMemberRepository.findByUserAndReadingGroupAndAcceptedTrue(user, group))
                .thenReturn(Optional.of(new GroupMember(group, user)));
        when(activityMemberRepository.existsByUserAndActivity(user, activity)).thenReturn(true);

        assertThrows(BadRequestException.class, () -> activityPolicy.assertJoinable(user, activity));
    }

    @Test
    void assertJoinable_activityEnded() {
        UserProfile user = UserProfile.builder().id(1L).build();
        ReadingGroup group = ReadingGroup.builder().id(10L).groupLeader(UserProfile.builder().id(2L).build()).isAutoApproval(true).build();
        Activity activity = Activity.builder()
                .id(5L)
                .group(group)
                .book(Ebook.builder().id(3L).build())
                .startTime(LocalDate.now().minusDays(2))
                .endTime(LocalDate.now().minusDays(1))
                .build();

        when(groupMemberRepository.findByUserAndReadingGroupAndAcceptedTrue(user, group))
                .thenReturn(Optional.of(new GroupMember(group, user)));
        when(activityMemberRepository.existsByUserAndActivity(user, activity)).thenReturn(false);

        assertThrows(BadRequestException.class, () -> activityPolicy.assertJoinable(user, activity));
    }

    @Test
    void assertJoinable_ebookNotPurchased() {
        UserProfile user = UserProfile.builder().id(1L).build();
        ReadingGroup group = ReadingGroup.builder().id(10L).groupLeader(UserProfile.builder().id(2L).build()).isAutoApproval(true).build();
        Ebook ebook = Ebook.builder().id(3L).build();
        Activity activity = Activity.builder()
                .id(5L)
                .group(group)
                .book(ebook)
                .startTime(LocalDate.now())
                .endTime(LocalDate.now().plusDays(1))
                .build();

        when(groupMemberRepository.findByUserAndReadingGroupAndAcceptedTrue(user, group))
                .thenReturn(Optional.of(new GroupMember(group, user)));
        when(activityMemberRepository.existsByUserAndActivity(user, activity)).thenReturn(false);
        org.mockito.Mockito.doThrow(new BadRequestException(qwerty.chaekit.global.enums.ErrorCode.EBOOK_NOT_PURCHASED))
                .when(ebookPolicy).assertEBookPurchased(user, ebook);

        assertThrows(BadRequestException.class, () -> activityPolicy.assertJoinable(user, activity));
    }

    @Test
    void assertActivityPeriodValid_invalidPeriod() {
        assertThrows(BadRequestException.class, () ->
                activityPolicy.assertActivityPeriodValid(1L, null, LocalDate.now().plusDays(2), LocalDate.now()));
    }

    @Test
    void assertActivityPeriodValid_validPeriod() {
        long groupId = 1L;
        LocalDate start1 = LocalDate.of(2024, 1, 1);
        LocalDate end1 = LocalDate.of(2024, 1, 10);
        LocalDate start2 = LocalDate.of(2024, 2, 1);
        LocalDate end2 = LocalDate.of(2024, 2, 10);

        Activity a1 = Activity.builder().id(1L).startTime(start1).endTime(end1).build();
        Activity a2 = Activity.builder().id(2L).startTime(start2).endTime(end2).build();

        when(activityRepository.findByGroup_Id(groupId)).thenReturn(java.util.List.of(a1, a2));

        assertDoesNotThrow(() -> activityPolicy.assertActivityPeriodValid(groupId, null, LocalDate.of(2024, 1, 11), LocalDate.of(2024, 1, 20)));
        assertDoesNotThrow(() -> activityPolicy.assertActivityPeriodValid(groupId, null, LocalDate.of(2023, 12, 1), LocalDate.of(2023, 12, 31)));
    }

    @Test
    void assertActivityPeriodValid_conflict() {
        long groupId = 1L;
        LocalDate start1 = LocalDate.of(2024, 1, 1);
        LocalDate end1 = LocalDate.of(2024, 1, 10);

        Activity a1 = Activity.builder().id(1L).startTime(start1).endTime(end1).build();

        when(activityRepository.findByGroup_Id(groupId)).thenReturn(java.util.List.of(a1));

        assertThrows(BadRequestException.class, () ->
                activityPolicy.assertActivityPeriodValid(groupId, null, LocalDate.of(2024, 1, 5), LocalDate.of(2024, 1, 15)));
    }

    @Test
    void assertActivityPeriodValid_ignoreSelfActivityId() {
        long groupId = 1L;
        LocalDate start1 = LocalDate.of(2024, 1, 1);
        LocalDate end1 = LocalDate.of(2024, 1, 10);

        Activity a1 = Activity.builder().id(1L).startTime(start1).endTime(end1).build();

        when(activityRepository.findByGroup_Id(groupId)).thenReturn(java.util.List.of(a1));

        assertDoesNotThrow(() -> activityPolicy.assertActivityPeriodValid(groupId, 1L, LocalDate.of(2024, 1, 5), LocalDate.of(2024, 1, 15)));
    }

    @Test
    void assertJoined_success() {
        UserProfile user = UserProfile.builder().id(1L).build();
        Activity activity = Activity.builder().id(2L).build();

        when(activityMemberRepository.existsByUserAndActivity(user, activity)).thenReturn(true);

        assertDoesNotThrow(() -> activityPolicy.assertJoined(user, activity));
    }

    @Test
    void assertJoined_longLong_success() {
        long userId = 1L;
        long activityId = 2L;
        UserProfile user = UserProfile.builder().id(userId).build();
        Activity activity = Activity.builder().id(activityId).build();

        when(activityMemberRepository.existsByUserAndActivity(refEq(user), refEq(activity))).thenReturn(true);

        assertDoesNotThrow(() -> activityPolicy.assertJoined(userId, activityId));
    }

    @Test
    void assertJoined_longLong_fail() {
        long userId = 1L;
        long activityId = 2L;
        UserProfile user = UserProfile.builder().id(userId).build();
        Activity activity = Activity.builder().id(activityId).build();

        when(activityMemberRepository.existsByUserAndActivity(refEq(user), refEq(activity))).thenReturn(false);

        assertThrows(qwerty.chaekit.global.exception.ForbiddenException.class, () -> activityPolicy.assertJoined(userId, activityId));
    }
}
