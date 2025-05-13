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
import qwerty.chaekit.domain.group.activity.repository.ActivityRepository;
import qwerty.chaekit.domain.group.activity.discussion.Discussion;
import qwerty.chaekit.domain.group.activity.discussion.comment.DiscussionComment;
import qwerty.chaekit.domain.group.activity.discussion.comment.repository.DiscussionCommentRepository;
import qwerty.chaekit.domain.group.activity.discussion.repository.DiscussionRepository;
import qwerty.chaekit.domain.member.user.UserProfile;
import qwerty.chaekit.domain.member.user.UserProfileRepository;
import qwerty.chaekit.dto.group.activity.discussion.DiscussionCommentFetchResponse;
import qwerty.chaekit.dto.group.activity.discussion.DiscussionCommentPostRequest;
import qwerty.chaekit.dto.group.activity.discussion.DiscussionDetailResponse;
import qwerty.chaekit.dto.group.activity.discussion.DiscussionFetchResponse;
import qwerty.chaekit.dto.group.activity.discussion.DiscussionPatchRequest;
import qwerty.chaekit.dto.group.activity.discussion.DiscussionPostRequest;
import qwerty.chaekit.dto.page.PageResponse;
import qwerty.chaekit.global.exception.BadRequestException;
import qwerty.chaekit.global.security.resolver.UserToken;
import qwerty.chaekit.mapper.DiscussionMapper;
import qwerty.chaekit.service.util.S3Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.*;

@ExtendWith(MockitoExtension.class)
class DiscussionServiceTest {
    private DiscussionService discussionService;

    @Mock
    private DiscussionRepository discussionRepository;

    @Mock
    private DiscussionCommentRepository discussionCommentRepository;

    @Mock
    private ActivityRepository activityRepository;

    @Mock
    private UserProfileRepository userProfileRepository;

    @Mock
    private S3Service s3Service;

    @BeforeEach
    void setUp() {
        DiscussionMapper discussionMapper = new DiscussionMapper(s3Service);

        discussionService = new DiscussionService(
                discussionRepository,
                discussionMapper,
                activityRepository,
                userProfileRepository,
                discussionCommentRepository
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
        UserToken userToken = UserToken.of(1L, 1L, "test@example.com");
        Long activityId = 1L;
        DiscussionPostRequest request = new DiscussionPostRequest(
                "Test Title",
                "Test Content",
                false
        );
        UserProfile user = UserProfile.builder()
                .id(userToken.userId())
                .build();

        given(activityRepository.existsById(activityId))
                .willReturn(true);
        given(userProfileRepository.findById(activityId))
                .willReturn(Optional.of(user));
        given(activityRepository.getReferenceById(activityId))
                .willReturn(Activity.builder().id(activityId).build());

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
        Discussion discussion = Discussion.builder()
                .id(discussionId)
                .activity(Activity.builder().id(1L).build())
                .title("Detail Test")
                .content("Detail Content")
                .author(author)
                .isDebate(false)
                .build();

        given(discussionRepository.findByIdWithAuthorAndComments(discussionId))
                .willReturn(Optional.of(discussion));
        given(discussionCommentRepository.countCommentsByDiscussionId(discussionId))
                .willReturn(3L);

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
    void updateDiscussion() {
        // given
        Long discussionId = 1L;
        UserToken userToken = UserToken.of(1L, 1L, "test@example.com");
        DiscussionPatchRequest request = new DiscussionPatchRequest("Updated Title", "Updated Content");
        UserProfile author = UserProfile.builder().id(1L).build();
        Discussion discussion = Discussion.builder()
                .id(discussionId)
                .activity(Activity.builder().id(1L).build())
                .title("Old Title")
                .content("Old Content")
                .author(author)
                .isDebate(false)
                .build();

        given(discussionRepository.findById(discussionId))
                .willReturn(Optional.of(discussion));
        given(discussionCommentRepository.countCommentsByDiscussionId(discussionId))
                .willReturn(2L);

        // when
        DiscussionFetchResponse response = discussionService.updateDiscussion(userToken, discussionId, request);

        // then
        assertNotNull(response);
        assertEquals("Updated Title", response.title());
        assertEquals("Updated Content", response.content());
        assertEquals(2L, response.commentCount());
    }

    @Test
    void deleteDiscussion_성공() {
        // given
        Long discussionId = 1L;
        UserToken userToken = UserToken.of(1L, 1L, "test@example.com");
        UserProfile author = UserProfile.builder().id(1L).build();
        Discussion discussion = Discussion.builder()
                .activity(Activity.builder().id(1L).build())
                .id(discussionId)
                .author(author)
                .build();

        given(discussionRepository.findById(discussionId))
                .willReturn(Optional.of(discussion));

        // when
        discussionService.deleteDiscussion(userToken, discussionId);

        // then
        verify(discussionRepository, times(1)).delete(discussion);
    }

    @Test
    void deleteDiscussion_작성자가_아님() {
        // given
        Long discussionId = 1L;
        UserToken userToken = UserToken.of(2L, 2L, "not-author@example.com"); // 다른 사용자
        UserProfile author = UserProfile.builder().id(1L).build();
        Discussion discussion = Discussion.builder()
                .activity(Activity.builder().id(1L).build())
                .id(discussionId)
                .author(author)
                .build();

        given(discussionRepository.findById(discussionId))
                .willReturn(Optional.of(discussion));

        // when & then
        assertThrows(BadRequestException.class, () -> discussionService.deleteDiscussion(userToken, discussionId));
    }

    @Test
    void addComment() {
        // given
        Long discussionId = 1L;
        Long userId = 1L;
        UserToken userToken = UserToken.of(userId, 1L, "test@example.com");
        DiscussionCommentPostRequest request = new DiscussionCommentPostRequest(null, "Test Comment", null);
        UserProfile author = UserProfile.builder().id(userId).build();
        Discussion discussion = Discussion.builder().id(discussionId).build();
        DiscussionComment comment = DiscussionComment.builder()
                .id(1L)
                .author(author)
                .discussion(discussion)
                .content("Test Comment")
                .build();

        given(discussionRepository.existsById(discussionId)).willReturn(true);
        given(userProfileRepository.getReferenceById(userId)).willReturn(author);
        given(discussionRepository.getReferenceById(discussionId)).willReturn(discussion);
        given(discussionCommentRepository.save(any(DiscussionComment.class))).willReturn(comment);

        // when
        DiscussionCommentFetchResponse response = discussionService.addComment(discussionId, request, userToken);

        // then
        assertNotNull(response);
        assertEquals("Test Comment", response.content());
        assertEquals(userId, response.authorId());
    }

    @Test
    void deleteComment() {
        // given
        Long commentId = 1L;
        Long userId = 1L;
        UserToken userToken = UserToken.of(userId, 1L, "test@example.com");
        DiscussionComment comment = DiscussionComment.builder()
                .id(commentId)
                .author(UserProfile.builder().id(userId).build())
                .build();

        given(discussionCommentRepository.findByIdWithParent(commentId))
                .willReturn(Optional.of(comment));
        given(discussionCommentRepository.countByParentId(commentId))
                .willReturn(0L);

        // when
        discussionService.deleteComment(commentId, userToken);

        // then
        verify(discussionCommentRepository, times(1)).delete(comment);
    }

    @Test
    void deleteComment_대댓글이_존재하는_댓글_삭제() {
        // given
        Long commentId = 1L;
        Long userId = 1L;
        UserToken userToken = UserToken.of(userId, 1L, "test@example.com");
        DiscussionComment comment = DiscussionComment.builder()
                .id(commentId)
                .author(UserProfile.builder().id(userId).build())
                .build();

        given(discussionCommentRepository.findByIdWithParent(commentId))
                .willReturn(Optional.of(comment));
        given(discussionCommentRepository.countByParentId(commentId))
                .willReturn(1L); // 대댓글이 존재

        // when
        discussionService.deleteComment(commentId, userToken);

        // then
        assertTrue(comment.isDeleted());
        verify(discussionCommentRepository, never()).delete(comment);
    }

    @Test
    void deleteComment_이미_삭제된_댓글의_마지막_대댓글_삭제() {
        // given
        Long parentCommentId = 1L;
        Long replyCommentId = 2L;
        Long userId = 1L;
        UserToken userToken = UserToken.of(userId, 1L, "test@example.com");
        DiscussionComment parentComment = DiscussionComment.builder()
                .id(parentCommentId)
                .author(UserProfile.builder().id(userId).build())
                .build();
        parentComment.softDelete();
        DiscussionComment replyComment = DiscussionComment.builder()
                .id(replyCommentId)
                .author(UserProfile.builder().id(userId).build())
                .parent(parentComment)
                .build();

        given(discussionCommentRepository.findByIdWithParent(replyCommentId))
                .willReturn(Optional.of(replyComment));
        given(discussionCommentRepository.countByParentId(parentCommentId))
                .willReturn(1L); // 마지막 대댓글
        given(discussionCommentRepository.countByParentId(replyCommentId))
                .willReturn(0L); // 대댓글에는 대댓글 없음

        // when
        discussionService.deleteComment(replyCommentId, userToken);

        // then
        verify(discussionCommentRepository, times(1)).delete(replyComment);
        verify(discussionCommentRepository, times(1)).delete(parentComment);
    }

    @Test
    void deleteComment_작성자가_아님() {
        // given
        Long commentId = 1L;
        Long userId = 2L; // 다른 사용자
        UserToken userToken = UserToken.of(1L, userId, "not-author@example.com");
        DiscussionComment comment = DiscussionComment.builder()
                .id(commentId)
                .author(UserProfile.builder().id(1L).build()) // 작성자 ID가 다름
                .build();

        given(discussionCommentRepository.findByIdWithParent(commentId))
                .willReturn(Optional.of(comment));

        // when & then
        assertThrows(BadRequestException.class, () -> discussionService.deleteComment(commentId, userToken));
    }

    @Test
    void deleteComment_대댓글_없이_삭제() {
        // given
        Long commentId = 1L;
        Long userId = 1L;
        UserToken userToken = UserToken.of(userId, 1L, "test@example.com");
        DiscussionComment comment = DiscussionComment.builder()
                .id(commentId)
                .author(UserProfile.builder().id(userId).build())
                .build();

        given(discussionCommentRepository.findByIdWithParent(commentId))
                .willReturn(Optional.of(comment));
        given(discussionCommentRepository.countByParentId(commentId))
                .willReturn(0L); // 대댓글 없음

        // when
        discussionService.deleteComment(commentId, userToken);

        // then
        verify(discussionCommentRepository, times(1)).delete(comment);
    }
}
