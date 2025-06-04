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
import qwerty.chaekit.global.exception.ForbiddenException;
import qwerty.chaekit.service.ebook.EbookPolicy;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

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
    void assertActivityPeriodValid_invalidPeriod() {
        assertThrows(BadRequestException.class, () ->
                activityPolicy.assertActivityPeriodValid(1L, null, LocalDate.now().plusDays(2), LocalDate.now()));
    }

    @Test
    void assertJoined_notParticipant() {
        UserProfile user = UserProfile.builder().id(1L).build();
        Activity activity = Activity.builder().id(2L).group(ReadingGroup.builder().id(1L).groupLeader(UserProfile.builder().id(3L).build()).isAutoApproval(true).build()).build();

        when(activityMemberRepository.existsByUserAndActivity(user, activity)).thenReturn(false);

        assertThrows(ForbiddenException.class, () -> activityPolicy.assertJoined(user, activity));
    }
}