package qwerty.chaekit.service.group;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import qwerty.chaekit.domain.group.activity.discussion.Discussion;
import qwerty.chaekit.domain.group.activity.discussion.comment.DiscussionComment;
import qwerty.chaekit.domain.group.activity.discussion.comment.repository.DiscussionCommentRepository;
import qwerty.chaekit.domain.member.user.UserProfile;
import qwerty.chaekit.dto.group.activity.discussion.DiscussionCommentFetchResponse;
import qwerty.chaekit.dto.group.activity.discussion.DiscussionCommentPostRequest;
import qwerty.chaekit.global.exception.BadRequestException;
import qwerty.chaekit.global.security.resolver.UserToken;
import qwerty.chaekit.mapper.DiscussionMapper;
import qwerty.chaekit.service.notification.NotificationService;
import qwerty.chaekit.service.util.EntityFinder;
import qwerty.chaekit.service.util.S3Service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class DiscussionCommentServiceTest {
    private DiscussionCommentService discussionCommentService;

    @Mock
    private DiscussionCommentRepository discussionCommentRepository;
    @Mock
    private ActivityPolicy activityPolicy;
    @Mock
    private NotificationService notificationService;
    @Mock
    private EntityFinder entityFinder;
    @Mock
    private S3Service s3Service;
    
    @BeforeEach
    void setUp() {
        DiscussionMapper discussionMapper = new DiscussionMapper(s3Service);

        discussionCommentService = new DiscussionCommentService(
                discussionCommentRepository,
                activityPolicy,
                discussionMapper,
                notificationService,
                entityFinder
        );
    }
    
    @Test
    void addComment() {
        // given
        Long discussionId = 1L;
        Long userId = 1L;
        Long discussionAuthorId = 2L;
        UserToken userToken = UserToken.of(userId, 1L, "test@example.com");
        DiscussionCommentPostRequest request = new DiscussionCommentPostRequest(null, "Test Comment", null);
        UserProfile author = UserProfile.builder().id(userId).build();
        UserProfile discussionAuthor = UserProfile.builder().id(discussionAuthorId).build();
        Discussion discussion = Discussion.builder()
                .id(discussionId)
                .author(discussionAuthor)
                .build();
        DiscussionComment comment = DiscussionComment.builder()
                .id(1L)
                .author(author)
                .discussion(discussion)
                .content("Test Comment")
                .build();

        given(entityFinder.findDiscussion(discussionId))
                .willReturn(discussion);
        given(entityFinder.findUser(userId))
                .willReturn(author);
        given(discussionCommentRepository.save(any(DiscussionComment.class)))
                .willReturn(comment);

        // when
        DiscussionCommentFetchResponse response = discussionCommentService.addComment(discussionId, request, userToken);

        // then
        assertNotNull(response);
        assertEquals("Test Comment", response.content());
        assertEquals(userId, response.authorId());
    }

    @Test
    void deleteComment() {
        // given
        Long memberId = 1L;
        Long userId = 1L;
        String email = "test@example.com";
        Long commentId = 1L;
        UserToken userToken = UserToken.of(memberId, userId, email);
        UserProfile author = UserProfile.builder().id(userId).build();
        DiscussionComment comment = DiscussionComment.builder()
                .id(commentId)
                .author(author)
                .build();

        given(entityFinder.findUser(userToken.userId()))
                .willReturn(author);
        given(entityFinder.findDiscussionComment(commentId))
                .willReturn(comment);
        
        given(discussionCommentRepository.countByParentId(commentId))
                .willReturn(0L);

        // when
        discussionCommentService.deleteComment(commentId, userToken);

        // then
        verify(discussionCommentRepository, times(1)).delete(comment);
    }

    @Test
    void deleteComment_대댓글이_존재하는_댓글_삭제() {
        // given
        Long memberId = 1L;
        Long userId = 1L;
        String email = "test@example.com";
        Long commentId = 1L;
        UserToken userToken = UserToken.of(memberId, userId, email);
        UserProfile author = UserProfile.builder().id(userId).build();
        DiscussionComment comment = DiscussionComment.builder()
                .id(commentId)
                .author(author)
                .build();

        given(entityFinder.findUser(userToken.userId()))
                .willReturn(author);
        given(entityFinder.findDiscussionComment(commentId))
                .willReturn(comment);
        given(discussionCommentRepository.countByParentId(commentId))
                .willReturn(1L); // 대댓글이 존재

        // when
        discussionCommentService.deleteComment(commentId, userToken);

        // then
        assertTrue(comment.isDeleted());
        verify(discussionCommentRepository, never()).delete(comment);
    }

    @Test
    void deleteComment_이미_삭제된_댓글의_마지막_대댓글_삭제() {
        // given
        Long parentCommentId = 1L;
        Long replyCommentId = 2L;
        Long authorId = 1L;
        UserToken userToken = UserToken.of(authorId, 1L, "test@example.com");
        UserProfile author = UserProfile.builder().id(authorId).build();
        
        DiscussionComment parentComment = DiscussionComment.builder()
                .id(parentCommentId)
                .author(author)
                .build();
        parentComment.softDelete();
        
        DiscussionComment replyComment = DiscussionComment.builder()
                .id(replyCommentId)
                .author(author)
                .parent(parentComment)
                .build();

        given(entityFinder.findUser(userToken.userId()))
                .willReturn(author);
        given(entityFinder.findDiscussionComment(replyCommentId))
                .willReturn(replyComment);
        
        given(discussionCommentRepository.countByParentId(parentCommentId))
                .willReturn(1L); // 마지막 대댓글
        given(discussionCommentRepository.countByParentId(replyCommentId))
                .willReturn(0L); // 대댓글에는 대댓글 없음

        // when
        discussionCommentService.deleteComment(replyCommentId, userToken);

        // then
        verify(discussionCommentRepository, times(1)).delete(replyComment);
        verify(discussionCommentRepository, times(1)).delete(parentComment);
    }

    @Test
    void deleteComment_작성자가_아님() {
        // given
        Long commentId = 1L;
        Long authorId = 2L; // 다른 사용자
        UserToken userToken = UserToken.of(1L, authorId, "not-author@example.com");
        UserProfile author = UserProfile.builder().id(authorId).build();
        DiscussionComment comment = DiscussionComment.builder()
                .id(commentId)
                .author(UserProfile.builder().id(1L).build()) // 작성자 ID가 다름
                .build();

        given(entityFinder.findDiscussionComment(commentId))
                .willReturn(comment);
        given(entityFinder.findUser(authorId))
                .willReturn(author);

        // when & then
        assertThrows(BadRequestException.class, () -> discussionCommentService.deleteComment(commentId, userToken));
    }

    @Test
    void deleteComment_대댓글_없이_삭제() {
        // given
        Long commentId = 1L;
        Long authorId = 1L;
        UserToken userToken = UserToken.of(authorId, 1L, "test@example.com");
        UserProfile author = UserProfile.builder().id(authorId).build();
        
        DiscussionComment comment = DiscussionComment.builder()
                .id(commentId)
                .author(UserProfile.builder().id(authorId).build())
                .build();

        given(entityFinder.findDiscussionComment(commentId))
                .willReturn(comment);
        given(entityFinder.findUser(authorId))
                .willReturn(author);
        
        given(discussionCommentRepository.countByParentId(commentId))
                .willReturn(0L); // 대댓글 없음

        // when
        discussionCommentService.deleteComment(commentId, userToken);

        // then
        verify(discussionCommentRepository, times(1)).delete(comment);
    }
}
