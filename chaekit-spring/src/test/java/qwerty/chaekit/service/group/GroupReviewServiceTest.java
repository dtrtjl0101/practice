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
import qwerty.chaekit.domain.group.review.*;
import qwerty.chaekit.domain.member.Member;
import qwerty.chaekit.domain.member.enums.Role;
import qwerty.chaekit.domain.member.user.UserProfile;
import qwerty.chaekit.dto.group.review.GroupReviewFetchResponse;
import qwerty.chaekit.dto.group.review.GroupReviewPostRequest;
import qwerty.chaekit.dto.group.review.GroupReviewStatsResponse;
import qwerty.chaekit.dto.group.review.TagStatDto;
import qwerty.chaekit.dto.page.PageResponse;
import qwerty.chaekit.global.exception.BadRequestException;
import qwerty.chaekit.global.security.resolver.UserToken;
import qwerty.chaekit.mapper.GroupReviewMapper;
import qwerty.chaekit.service.util.EntityFinder;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GroupReviewServiceTest {
    @InjectMocks
    private GroupReviewService groupReviewService;

    @Mock
    private GroupReviewRepository groupReviewRepository;
    @Mock
    private GroupReviewTagRepository groupReviewTagRepository;
    @Mock
    private EntityFinder entityFinder;
    @Mock
    private GroupReviewMapper groupReviewMapper;
    @Mock
    private ActivityPolicy activityPolicy;

    @Test
    void createReview_newReview() {
        long userId = 1L;
        long groupId = 10L;
        long activityId = 5L;
        UserToken token = UserToken.of(userId, userId, "u@b.c");
        UserProfile user = UserProfile.builder()
                .id(userId)
                .member(Member.builder().id(1L).email("u@b.c").password("p").role(Role.ROLE_USER).build())
                .nickname("u").build();
        ReadingGroup group = ReadingGroup.builder().id(groupId).groupLeader(UserProfile.builder().id(2L).build()).build();
        Activity activity = Activity.builder()
                .id(activityId)
                .group(group)
                .book(Ebook.builder().id(3L).title("t").author("a").coverImageKey("c").build())
                .startTime(LocalDate.now())
                .endTime(LocalDate.now())
                .build();
        GroupReviewPostRequest req = new GroupReviewPostRequest(activityId, "good", List.of(GroupReviewTag.FUNNY));
        GroupReviewFetchResponse mapped = GroupReviewFetchResponse.builder().reviewId(1L).groupId(groupId).content("good").build();

        when(entityFinder.findUser(userId)).thenReturn(user);
        when(entityFinder.findGroup(groupId)).thenReturn(group);
        when(entityFinder.findActivity(activityId)).thenReturn(activity);
        when(groupReviewRepository.findByActivityAndAuthor(activity, user)).thenReturn(Optional.empty());
        when(groupReviewRepository.save(any(GroupReview.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(groupReviewMapper.toFetchResponse(any(GroupReview.class))).thenReturn(mapped);

        // when
        GroupReviewFetchResponse result = groupReviewService.createReview(token, groupId, req);

        // then
        assertEquals("good", result.content());
        verify(activityPolicy).assertJoined(user, activity);
        verify(groupReviewRepository).save(any(GroupReview.class));
        verify(groupReviewMapper).toFetchResponse(any(GroupReview.class));
    }

    @Test
    void createReview_groupMismatch() {
        UserToken token = UserToken.of(1L,1L,"a@b.c");
        UserProfile user = UserProfile.builder().id(1L).build();
        ReadingGroup group = ReadingGroup.builder().id(1L).groupLeader(UserProfile.builder().id(2L).build()).build();
        ReadingGroup other = ReadingGroup.builder().id(2L).groupLeader(UserProfile.builder().id(3L).build()).build();
        Activity activity = Activity.builder().id(3L).group(other).book(Ebook.builder().id(4L).build()).startTime(LocalDate.now()).endTime(LocalDate.now()).build();
        GroupReviewPostRequest req = new GroupReviewPostRequest(3L, "bad", List.of());

        when(entityFinder.findUser(1L)).thenReturn(user);
        when(entityFinder.findGroup(1L)).thenReturn(group);
        when(entityFinder.findActivity(3L)).thenReturn(activity);

        assertThrows(BadRequestException.class, () -> groupReviewService.createReview(token, 1L, req));
    }

    @Test
    void createReview_existingReview() {
        long userId = 1L;
        long groupId = 10L;
        long activityId = 5L;
        UserToken token = UserToken.of(userId, userId, "u@b.c");
        UserProfile user = UserProfile.builder()
                .id(userId)
                .member(Member.builder().id(1L).email("u@b.c").password("p").role(Role.ROLE_USER).build())
                .nickname("u").build();
        ReadingGroup group = ReadingGroup.builder().id(groupId).groupLeader(UserProfile.builder().id(2L).build()).build();
        Activity activity = Activity.builder()
                .id(activityId)
                .group(group)
                .book(Ebook.builder().id(3L).title("t").author("a").coverImageKey("c").build())
                .startTime(LocalDate.now())
                .endTime(LocalDate.now())
                .build();
        GroupReviewPostRequest req = new GroupReviewPostRequest(activityId, "updated content", List.of(GroupReviewTag.FUNNY));
        GroupReview existingReview = GroupReview.builder()
                .id(100L)
                .group(group)
                .author(user)
                .activity(activity)
                .content("old content")
                .build();
        GroupReviewFetchResponse mapped = GroupReviewFetchResponse.builder().reviewId(100L).groupId(groupId).content("updated content").build();

        when(entityFinder.findUser(userId)).thenReturn(user);
        when(entityFinder.findGroup(groupId)).thenReturn(group);
        when(entityFinder.findActivity(activityId)).thenReturn(activity);
        when(groupReviewRepository.findByActivityAndAuthor(activity, user)).thenReturn(Optional.of(existingReview));
        when(groupReviewRepository.save(existingReview)).thenReturn(existingReview);
        when(groupReviewMapper.toFetchResponse(existingReview)).thenReturn(mapped);

        GroupReviewFetchResponse result = groupReviewService.createReview(token, groupId, req);

        assertEquals("updated content", existingReview.getContent());
        assertEquals("updated content", result.content());
        verify(activityPolicy).assertJoined(user, activity);
        verify(groupReviewRepository).save(existingReview);
        verify(groupReviewMapper).toFetchResponse(existingReview);
    }

    @Test
    void getReviews_success() {
        long groupId = 10L;
        ReadingGroup group = ReadingGroup.builder().id(groupId).groupLeader(UserProfile.builder().id(1L).build()).build();
        GroupReview review = GroupReview.builder().group(group).activity(Activity.builder().id(1L).group(group).book(Ebook.builder().id(2L).build()).startTime(LocalDate.now()).endTime(LocalDate.now()).build()).author(UserProfile.builder().id(3L).build()).content("c").build();
        Pageable pageable = PageRequest.of(0,10);
        Page<GroupReview> page = new PageImpl<>(List.of(review));
        GroupReviewFetchResponse mapped = GroupReviewFetchResponse.builder().reviewId(1L).groupId(groupId).content("c").build();

        when(groupReviewRepository.findByGroupId(groupId, pageable)).thenReturn(page);
        when(groupReviewMapper.toFetchResponse(review)).thenReturn(mapped);

        PageResponse<GroupReviewFetchResponse> result = groupReviewService.getReviews(groupId, pageable);

        assertEquals(1, result.content().size());
        assertEquals("c", result.content().get(0).content());
    }

    @Test
    void getReviewStats_success() {
        long groupId = 1L;
        ReadingGroup group = ReadingGroup.builder().id(groupId).groupLeader(UserProfile.builder().id(2L).build()).build();
        TagStatDto stat = new TagStatDto(GroupReviewTag.FUNNY, 2L);
        when(entityFinder.findGroup(groupId)).thenReturn(group);
        when(groupReviewRepository.countByGroup(group)).thenReturn(5L);
        when(groupReviewTagRepository.countTagsByGroupId(group)).thenReturn(List.of(stat));

        GroupReviewStatsResponse result = groupReviewService.getReviewStats(groupId);

        assertEquals(5L, result.reviewCount());
        assertEquals(2L, result.tagCount());
        assertEquals(stat, result.tagStats().get(0));
    }
}
