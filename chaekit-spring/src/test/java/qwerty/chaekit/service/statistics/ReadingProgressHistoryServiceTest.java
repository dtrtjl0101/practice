package qwerty.chaekit.service.statistics;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import qwerty.chaekit.domain.ebook.Ebook;
import qwerty.chaekit.domain.ebook.history.ReadingProgressHistory;
import qwerty.chaekit.domain.ebook.history.ReadingProgressHistoryRepository;
import qwerty.chaekit.domain.ebook.purchase.EbookPurchase;
import qwerty.chaekit.domain.ebook.purchase.repository.EbookPurchaseRepository;
import qwerty.chaekit.domain.group.ReadingGroup;
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
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReadingProgressHistoryServiceTest {

    @InjectMocks
    private ReadingProgressHistoryService readingProgressHistoryService;

    @Mock
    private ActivityRepository activityRepository;
    @Mock
    private ActivityMemberRepository activityMemberRepository;
    @Mock
    private EbookPurchaseRepository ebookPurchaseRepository;
    @Mock
    private ReadingProgressHistoryRepository historyRepository;
    @Mock
    private ActivityPolicy activityPolicy;
    @Mock
    private EntityFinder entityFinder;

    @Test
    void getHistory_성공() {
        // given
        Long userId = 1L;
        Long activityId = 1L;
        Long groupId = 1L;
        Long bookId = 1L;
        
        UserToken userToken = UserToken.of(userId, userId, "test@test.com");
        UserProfile user = UserProfile.builder().id(userId).build();
        ReadingGroup group = ReadingGroup.builder().id(groupId).build();
        Ebook ebook = Ebook.builder().id(bookId).build();
        Activity activity = Activity.builder()
                .id(activityId)
                .group(group)
                .book(ebook)
                .startTime(LocalDate.now().minusDays(7))
                .endTime(LocalDate.now().plusDays(7))
                .build();
        
        ActivityMember activityMember = ActivityMember.builder()
                .activity(activity)
                .user(user)
                .build();
        activityMember.resetCreatedAt(LocalDateTime.now().minusDays(3));

        EbookPurchase ebookPurchase = EbookPurchase.builder()
                .user(user)
                .ebook(ebook)
                .percentage(50L)
                .build();

        ReadingProgressHistory history = ReadingProgressHistory.builder()
                .activity(activity)
                .user(user)
                .percentage(30L)
                .build();
        history.resetCreatedAt(LocalDateTime.now().minusDays(2));

        // when
        when(entityFinder.findUser(userId)).thenReturn(user);
        when(entityFinder.findActivity(activityId)).thenReturn(activity);
        when(activityMemberRepository.findByUserAndActivity(user, activity))
                .thenReturn(Optional.of(activityMember));
        when(activityMemberRepository.findByActivity(activity))
                .thenReturn(List.of(activityMember));
        when(ebookPurchaseRepository.findByUserIdInAndEbook(List.of(userId), ebook))
                .thenReturn(List.of(ebookPurchase));
        when(historyRepository.findByActivityAndCreatedAtBetween(
                eq(activity),
                any(LocalDateTime.class),
                any(LocalDateTime.class)
        )).thenReturn(List.of(history));

        List<ReadingProgressHistoryResponse> result = readingProgressHistoryService.getHistory(userToken, activityId);

        // then
        assertThat(result).isNotEmpty();
        verify(activityPolicy).assertJoined(user, activity);
    }

    @Test
    void getHistory_활동_멤버가_아닌_경우_실패() {
        // given
        Long userId = 1L;
        Long activityId = 1L;
        
        UserToken userToken = UserToken.of(userId, userId, "test@test.com");
        UserProfile user = UserProfile.builder().id(userId).build();
        Activity activity = Activity.builder().id(activityId).build();

        // when
        when(entityFinder.findUser(userId)).thenReturn(user);
        when(entityFinder.findActivity(activityId)).thenReturn(activity);
        when(activityMemberRepository.findByUserAndActivity(user, activity))
                .thenReturn(Optional.empty());

        // then
        ForbiddenException exception = assertThrows(ForbiddenException.class, 
            () -> readingProgressHistoryService.getHistory(userToken, activityId));
        assertThat(exception.getErrorCode()).isEqualTo(ErrorCode.ACTIVITY_MEMBER_ONLY.getCode());
    }

    @Test
    void snapshotDailyProgress_성공() {
        // given
        Long userId = 1L;
        Long activityId = 1L;
        Long groupId = 1L;
        Long bookId = 1L;
        
        UserProfile user = UserProfile.builder().id(userId).build();
        ReadingGroup group = ReadingGroup.builder().id(groupId).build();
        Ebook ebook = Ebook.builder().id(bookId).build();
        Activity activity = Activity.builder()
                .id(activityId)
                .group(group)
                .book(ebook)
                .startTime(LocalDate.now().minusDays(7))
                .endTime(LocalDate.now().plusDays(7))
                .build();
        
        ActivityMember activityMember = ActivityMember.builder()
                .activity(activity)
                .user(user)
                .build();
        activityMember.resetCreatedAt(LocalDateTime.now().minusDays(3));

        EbookPurchase ebookPurchase = EbookPurchase.builder()
                .user(user)
                .ebook(ebook)
                .percentage(50L)
                .build();

        // when
        when(activityRepository.findByStartTimeLessThanEqualAndEndTimeGreaterThanEqual(
                any(LocalDate.class),
                any(LocalDate.class)
        )).thenReturn(List.of(activity));
        when(activityMemberRepository.findByActivity(activity))
                .thenReturn(List.of(activityMember));
        when(ebookPurchaseRepository.findByUserAndEbook(user, ebook))
                .thenReturn(Optional.of(ebookPurchase));
        when(historyRepository.save(any(ReadingProgressHistory.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        readingProgressHistoryService.snapshotDailyProgress();

        // then
        verify(activityRepository).findByStartTimeLessThanEqualAndEndTimeGreaterThanEqual(
                any(LocalDate.class),
                any(LocalDate.class)
        );
        verify(activityMemberRepository).findByActivity(activity);
        verify(ebookPurchaseRepository).findByUserAndEbook(user, ebook);
        verify(historyRepository).save(argThat(history -> 
            history.getActivity().equals(activity) &&
            history.getUser().equals(user) &&
            history.getPercentage() == 50L
        ));
    }

    @Test
    void snapshotDailyProgress_구매_기록이_없는_경우() {
        // given
        Long userId = 1L;
        Long activityId = 1L;
        Long groupId = 1L;
        Long bookId = 1L;
        
        UserProfile user = UserProfile.builder().id(userId).build();
        ReadingGroup group = ReadingGroup.builder().id(groupId).build();
        Ebook ebook = Ebook.builder().id(bookId).build();
        Activity activity = Activity.builder()
                .id(activityId)
                .group(group)
                .book(ebook)
                .startTime(LocalDate.now().minusDays(7))
                .endTime(LocalDate.now().plusDays(7))
                .build();
        
        ActivityMember activityMember = ActivityMember.builder()
                .activity(activity)
                .user(user)
                .build();
        activityMember.resetCreatedAt(LocalDateTime.now().minusDays(3));

        // when
        when(activityRepository.findByStartTimeLessThanEqualAndEndTimeGreaterThanEqual(
                any(LocalDate.class),
                any(LocalDate.class)
        )).thenReturn(List.of(activity));
        when(activityMemberRepository.findByActivity(activity))
                .thenReturn(List.of(activityMember));
        when(ebookPurchaseRepository.findByUserAndEbook(user, ebook))
                .thenReturn(Optional.empty());
        when(historyRepository.save(any(ReadingProgressHistory.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        readingProgressHistoryService.snapshotDailyProgress();

        // then
        verify(activityRepository).findByStartTimeLessThanEqualAndEndTimeGreaterThanEqual(
                any(LocalDate.class),
                any(LocalDate.class)
        );
        verify(activityMemberRepository).findByActivity(activity);
        verify(ebookPurchaseRepository).findByUserAndEbook(user, ebook);
        verify(historyRepository).save(argThat(history -> 
            history.getActivity().equals(activity) &&
            history.getUser().equals(user) &&
            history.getPercentage() == 0L
        ));
    }
} 