package qwerty.chaekit.service.group;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import qwerty.chaekit.domain.group.activity.Activity;
import qwerty.chaekit.domain.group.activity.discussion.Discussion;
import qwerty.chaekit.domain.group.activity.discussion.comment.DiscussionComment;
import qwerty.chaekit.domain.group.activity.discussion.comment.repository.DiscussionCommentRepository;
import qwerty.chaekit.domain.group.activity.discussion.repository.DiscussionRepository;
import qwerty.chaekit.domain.highlight.repository.HighlightRepository;
import qwerty.chaekit.domain.member.user.UserProfile;
import qwerty.chaekit.dto.group.activity.discussion.DiscussionDetailResponse;
import qwerty.chaekit.dto.group.activity.discussion.DiscussionFetchResponse;
import qwerty.chaekit.dto.group.activity.discussion.DiscussionPatchRequest;
import qwerty.chaekit.dto.group.activity.discussion.DiscussionPostRequest;
import qwerty.chaekit.dto.page.PageResponse;
import qwerty.chaekit.global.security.resolver.UserToken;
import qwerty.chaekit.mapper.DiscussionMapper;
import qwerty.chaekit.service.util.EntityFinder;
import qwerty.chaekit.service.util.FileService;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class DiscussionServiceTest {
    private DiscussionService discussionService;

    @Mock
    private DiscussionRepository discussionRepository;

    @Mock
    private DiscussionCommentRepository discussionCommentRepository;

    @Mock
    private HighlightRepository highlightRepository;
    
    @Mock
    private ActivityPolicy activityPolicy;
    
    @Mock
    private EntityFinder entityFinder;

    @Mock
    private FileService fileService;

    @BeforeEach
    void setUp() {
        DiscussionMapper discussionMapper = new DiscussionMapper(fileService);

        discussionService = new DiscussionService(
                discussionRepository,
                discussionMapper,
                discussionCommentRepository,
                highlightRepository,
                activityPolicy,
                entityFinder
        );
    }


    @Test
    void getDiscussions() {
        // given
        Long activityId = 1L;
        UserToken userToken = UserToken.of(1L, 1L, "test@example.com");
        UserProfile userProfile = UserProfile.builder()
                .id(1L)
                .build();
        Activity activity = Activity.builder()
                .id(activityId)
                .build();
        Pageable pageable = PageRequest.of(0, 10);

        Discussion discussion = Discussion.builder()
                .id(1L)
                .title("Test Discussion")
                .content("This is a test discussion.")
                .author(userProfile)
                .activity(activity)
                .isDebate(false)
                .build();

        given(discussionRepository.findByActivityId(activityId, pageable))
                .willReturn(new PageImpl<>(List.of(discussion)));

        given(discussionCommentRepository.countCommentsByDiscussionIds(List.of(1L)))
                .willReturn(Map.of(1L, 5L));

        // when
        PageResponse<DiscussionFetchResponse> response = discussionService.getDiscussions(userToken, pageable, activityId);

        // then
        assertNotNull(response);
        assertEquals(1, response.content().size());
        DiscussionFetchResponse discussionResponse = response.content().get(0);
        assertEquals("Test Discussion", discussionResponse.title());
        assertEquals("This is a test discussion.", discussionResponse.content());
        assertEquals(5L, discussionResponse.commentCount());
        assertFalse(discussionResponse.isDebate());
    }

    @Test
    void createDiscussion() {
        // given
        Long userId = 1L;
        Long activityId = 1L;
        UserToken userToken = UserToken.of(1L, userId, "test@example.com");
        DiscussionPostRequest request = new DiscussionPostRequest(
                "Test Title",
                "Test Content",
                false,
                null
        );
        UserProfile user = UserProfile.builder()
                .id(userId)
                .build();
        Activity activity = Activity.builder()
                .id(activityId)
                .build();
                

        given(entityFinder.findUser(userId))
                .willReturn(user);
        given(entityFinder.findActivity(activityId))
                .willReturn(activity);

        // when
        DiscussionFetchResponse response = discussionService.createDiscussion(userToken, activityId, request);
        // then
        assertNotNull(response);
        assertEquals(activityId, response.activityId());
        assertEquals(user.getId(), response.authorId());
        assertEquals(request.title(), response.title());
        assertEquals(request.content(), response.content());
        assertEquals(request.isDebate(), response.isDebate());
        assertEquals(0L, response.commentCount());
        assertEquals(user.getId(), response.authorId());
    }

    @Test
    void getDiscussionDetail() {
        // given
        Long discussionId = 1L;
        UserToken userToken = UserToken.of(1L, 1L, "test@example.com");
        UserProfile author = UserProfile.builder().id(1L).build();
        UserProfile commentAuthor = UserProfile.builder().id(2L).build();
        Discussion discussion = Discussion.builder()
                .id(discussionId)
                .activity(Activity.builder().id(1L).build())
                .title("Detail Test")
                .content("Detail Content")
                .author(author)
                .isDebate(false)
                .build();
        discussion.addComment(DiscussionComment.builder().id(1L).author(commentAuthor).build());
        discussion.addComment(DiscussionComment.builder().id(2L).author(commentAuthor).build());
        discussion.addComment(DiscussionComment.builder().id(3L).author(commentAuthor).build());

        given(discussionRepository.findByIdWithAuthorAndComments(discussionId))
                .willReturn(Optional.of(discussion));

        // when
        DiscussionDetailResponse response = discussionService.getDiscussionDetail(userToken, discussionId);

        // then
        assertNotNull(response);
        assertEquals(discussionId, response.discussionId());
        assertEquals("Detail Test", response.title());
        assertEquals("Detail Content", response.content());
        assertEquals(3L, response.commentCount());
        assertFalse(response.isDebate());
    }

    @Test
    void updateDiscussion_success() {
        // given
        Long userId = 1L;
        Long activityId = 100L;
        Long commentAuthorId = 5L;
        Long discussionId = 10L;

        UserToken userToken = UserToken.of(null, userId, "user@example.com");
        UserProfile user = UserProfile.builder().id(userId).build();
        UserProfile commentAuthor = UserProfile.builder().id(commentAuthorId).build();
        
        Discussion discussion = Discussion.builder()
                .id(discussionId)
                .author(user)
                .activity(Activity.builder().id(activityId).build())
                .title("Old Title")
                .content("Old Content")
                .build();
        discussion.addComment(DiscussionComment.builder().id(discussionId).author(commentAuthor).build());
        discussion.addComment(DiscussionComment.builder().id(discussionId).author(commentAuthor).build());

        DiscussionPatchRequest request = new DiscussionPatchRequest("New Title", "New Content");

        given(entityFinder.findUser(userId)).willReturn(user);
        given(entityFinder.findDiscussion(discussionId)).willReturn(discussion);
        given(discussionCommentRepository.countCommentsByDiscussionId(discussionId)).willReturn(2L);

        // when
        DiscussionFetchResponse result = discussionService.updateDiscussion(userToken, discussionId, request);

        // then
        assertEquals("New Title", result.title());
        assertEquals("New Content", result.content());
    }
    
    @Test
    void deleteDiscussion_success() {
        // given
        Long userId = 1L;
        Long discussionId = 100L;
        UserProfile user = UserProfile.builder().id(userId).build();
        Discussion discussion = Discussion.builder().id(discussionId).author(user).build();
        UserToken token = UserToken.of(null, userId, "test@example.com");

        // stub
        given(entityFinder.findUser(userId)).willReturn(user);
        given(entityFinder.findDiscussion(discussionId)).willReturn(discussion);

        // when
        discussionService.deleteDiscussion(token, discussionId);

        // then
        verify(discussionRepository).delete(discussion);
    }
}
