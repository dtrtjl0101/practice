package qwerty.chaekit.service.util;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import qwerty.chaekit.domain.ebook.Ebook;
import qwerty.chaekit.domain.ebook.repository.EbookRepository;
import qwerty.chaekit.domain.ebook.request.EbookRequest;
import qwerty.chaekit.domain.ebook.request.EbookRequestRepository;
import qwerty.chaekit.domain.group.ReadingGroup;
import qwerty.chaekit.domain.group.activity.Activity;
import qwerty.chaekit.domain.group.activity.discussion.Discussion;
import qwerty.chaekit.domain.group.activity.discussion.comment.DiscussionComment;
import qwerty.chaekit.domain.group.activity.discussion.comment.repository.DiscussionCommentRepository;
import qwerty.chaekit.domain.group.activity.discussion.repository.DiscussionRepository;
import qwerty.chaekit.domain.group.activity.repository.ActivityRepository;
import qwerty.chaekit.domain.group.repository.GroupRepository;
import qwerty.chaekit.domain.highlight.Highlight;
import qwerty.chaekit.domain.highlight.repository.HighlightRepository;
import qwerty.chaekit.domain.member.user.UserProfile;
import qwerty.chaekit.domain.member.user.UserProfileRepository;
import qwerty.chaekit.global.exception.NotFoundException;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;
import static qwerty.chaekit.global.enums.ErrorCode.*;

@ExtendWith(MockitoExtension.class)
class EntityFinderTest {

    @InjectMocks
    private EntityFinder entityFinder;

    @Mock
    private UserProfileRepository userRepository;
    @Mock
    private EbookRepository ebookRepository;
    @Mock
    private ActivityRepository activityRepository;
    @Mock
    private GroupRepository groupRepository;
    @Mock
    private HighlightRepository highlightRepository;
    @Mock
    private DiscussionRepository discussionRepository;
    @Mock
    private DiscussionCommentRepository discussionCommentRepository;
    @Mock
    private EbookRequestRepository ebookRequestRepository;

    @Test
    void findUser_성공() {
        // given
        Long userId = 1L;
        UserProfile expectedUser = UserProfile.builder().id(userId).build();
        when(userRepository.findById(userId)).thenReturn(Optional.of(expectedUser));

        // when
        UserProfile result = entityFinder.findUser(userId);

        // then
        assertThat(result).isEqualTo(expectedUser);
    }

    @Test
    void findUser_실패_존재하지_않음() {
        // given
        Long userId = 1L;
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> entityFinder.findUser(userId))
            .isInstanceOf(NotFoundException.class)
            .hasFieldOrPropertyWithValue("errorCode", USER_NOT_FOUND.getCode());
    }


    @Test
    void findEbook_성공() {
        // given
        Long ebookId = 1L;
        Ebook expectedEbook = Ebook.builder().id(ebookId).build();
        when(ebookRepository.findById(ebookId)).thenReturn(Optional.of(expectedEbook));

        // when
        Ebook result = entityFinder.findEbook(ebookId);

        // then
        assertThat(result).isEqualTo(expectedEbook);
    }

    @Test
    void findEbook_실패_존재하지_않음() {
        // given
        Long ebookId = 1L;
        when(ebookRepository.findById(ebookId)).thenReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> entityFinder.findEbook(ebookId))
            .isInstanceOf(NotFoundException.class)
            .hasFieldOrPropertyWithValue("errorCode", EBOOK_NOT_FOUND.getCode());
    }

    @Test
    void findActivity_성공() {
        // given
        Long activityId = 1L;
        Activity expectedActivity = Activity.builder().id(activityId).build();
        when(activityRepository.findById(activityId)).thenReturn(Optional.of(expectedActivity));

        // when
        Activity result = entityFinder.findActivity(activityId);

        // then
        assertThat(result).isEqualTo(expectedActivity);
    }

    @Test
    void findActivity_실패_존재하지_않음() {
        // given
        Long activityId = 1L;
        when(activityRepository.findById(activityId)).thenReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> entityFinder.findActivity(activityId))
            .isInstanceOf(NotFoundException.class)
            .hasFieldOrPropertyWithValue("errorCode", ACTIVITY_NOT_FOUND.getCode());
    }

    @Test
    void findGroup_성공() {
        // given
        Long groupId = 1L;
        ReadingGroup expectedGroup = ReadingGroup.builder().id(groupId).build();
        when(groupRepository.findById(groupId)).thenReturn(Optional.of(expectedGroup));

        // when
        ReadingGroup result = entityFinder.findGroup(groupId);

        // then
        assertThat(result).isEqualTo(expectedGroup);
    }

    @Test
    void findGroup_실패_존재하지_않음() {
        // given
        Long groupId = 1L;
        when(groupRepository.findById(groupId)).thenReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> entityFinder.findGroup(groupId))
            .isInstanceOf(NotFoundException.class)
            .hasFieldOrPropertyWithValue("errorCode", GROUP_NOT_FOUND.getCode());
    }

    @Test
    void findHighlight_성공() {
        // given
        Long highlightId = 1L;
        Highlight expectedHighlight = Highlight.builder().id(highlightId).build();
        when(highlightRepository.findById(highlightId)).thenReturn(Optional.of(expectedHighlight));

        // when
        Highlight result = entityFinder.findHighlight(highlightId);

        // then
        assertThat(result).isEqualTo(expectedHighlight);
    }

    @Test
    void findHighlight_실패_존재하지_않음() {
        // given
        Long highlightId = 1L;
        when(highlightRepository.findById(highlightId)).thenReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> entityFinder.findHighlight(highlightId))
            .isInstanceOf(NotFoundException.class)
            .hasFieldOrPropertyWithValue("errorCode", HIGHLIGHT_NOT_FOUND.getCode());
    }

    @Test
    void findDiscussion_성공() {
        // given
        Long discussionId = 1L;
        Discussion expectedDiscussion = Discussion.builder().id(discussionId).build();
        when(discussionRepository.findById(discussionId)).thenReturn(Optional.of(expectedDiscussion));

        // when
        Discussion result = entityFinder.findDiscussion(discussionId);

        // then
        assertThat(result).isEqualTo(expectedDiscussion);
    }

    @Test
    void findDiscussion_실패_존재하지_않음() {
        // given
        Long discussionId = 1L;
        when(discussionRepository.findById(discussionId)).thenReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> entityFinder.findDiscussion(discussionId))
            .isInstanceOf(NotFoundException.class)
            .hasFieldOrPropertyWithValue("errorCode", DISCUSSION_NOT_FOUND.getCode());
    }

    @Test
    void findDiscussionComment_성공() {
        // given
        Long commentId = 1L;
        DiscussionComment expectedComment = DiscussionComment.builder().id(commentId).build();
        when(discussionCommentRepository.findById(commentId)).thenReturn(Optional.of(expectedComment));

        // when
        DiscussionComment result = entityFinder.findDiscussionComment(commentId);

        // then
        assertThat(result).isEqualTo(expectedComment);
    }

    @Test
    void findDiscussionComment_실패_존재하지_않음() {
        // given
        Long commentId = 1L;
        when(discussionCommentRepository.findById(commentId)).thenReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> entityFinder.findDiscussionComment(commentId))
            .isInstanceOf(NotFoundException.class)
            .hasFieldOrPropertyWithValue("errorCode", DISCUSSION_COMMENT_NOT_FOUND.getCode());
    }

    @Test
    void findEbookRequest_성공() {
        // given
        Long requestId = 1L;
        EbookRequest expectedRequest = EbookRequest.builder().id(requestId).build();
        when(ebookRequestRepository.findById(requestId)).thenReturn(Optional.of(expectedRequest));

        // when
        EbookRequest result = entityFinder.findEbookRequest(requestId);

        // then
        assertThat(result).isEqualTo(expectedRequest);
    }

    @Test
    void findEbookRequest_실패_존재하지_않음() {
        // given
        Long requestId = 1L;
        when(ebookRequestRepository.findById(requestId)).thenReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> entityFinder.findEbookRequest(requestId))
            .isInstanceOf(NotFoundException.class)
            .hasFieldOrPropertyWithValue("errorCode", EBOOK_REQUEST_NOT_FOUND.getCode());
    }
} 