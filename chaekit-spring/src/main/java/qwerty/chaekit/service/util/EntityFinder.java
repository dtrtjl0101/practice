package qwerty.chaekit.service.util;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
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
import qwerty.chaekit.domain.highlight.entity.Highlight;
import qwerty.chaekit.domain.highlight.repository.HighlightRepository;
import qwerty.chaekit.domain.member.publisher.PublisherProfile;
import qwerty.chaekit.domain.member.publisher.PublisherProfileRepository;
import qwerty.chaekit.domain.member.user.UserProfile;
import qwerty.chaekit.domain.member.user.UserProfileRepository;
import qwerty.chaekit.global.exception.NotFoundException;

import static qwerty.chaekit.global.enums.ErrorCode.*;

@Service
@RequiredArgsConstructor
public class EntityFinder {

    private final UserProfileRepository userRepository;
    private final PublisherProfileRepository publisherRepository;
    private final EbookRepository ebookRepository;
    private final ActivityRepository activityRepository;
    private final GroupRepository groupRepository;
    private final HighlightRepository highlightRepository;
    private final DiscussionRepository discussionRepository;
    private final DiscussionCommentRepository discussionCommentRepository;
    private final EbookRequestRepository ebookRequestRepository;

    public UserProfile findUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException(USER_NOT_FOUND));
    }

    public PublisherProfile findPublisher(Long id) {
        return publisherRepository.findById(id)
                .orElseThrow(() -> new NotFoundException(PUBLISHER_NOT_FOUND));
    }

    public Ebook findEbook(Long id) {
        return ebookRepository.findById(id)
                .orElseThrow(() -> new NotFoundException(EBOOK_NOT_FOUND));
    }

    public Activity findActivity(Long id) {
        return activityRepository.findById(id)
                .orElseThrow(() -> new NotFoundException(ACTIVITY_NOT_FOUND));
    }

    public ReadingGroup findGroup(Long id) {
        return groupRepository.findById(id)
                .orElseThrow(() -> new NotFoundException(GROUP_NOT_FOUND));
    }
    
    public Highlight findHighlight(Long id) {
        return highlightRepository.findById(id)
                .orElseThrow(() -> new NotFoundException(HIGHLIGHT_NOT_FOUND));
    }
    
    public Discussion findDiscussion(Long id) {
        return discussionRepository.findById(id)
                .orElseThrow(() -> new NotFoundException(DISCUSSION_NOT_FOUND));
    }
    
    public DiscussionComment findDiscussionComment(Long id) {
        return discussionCommentRepository.findById(id)
                .orElseThrow(() -> new NotFoundException(DISCUSSION_COMMENT_NOT_FOUND));
    }
    
    public EbookRequest findEbookRequest(Long id) {
        return ebookRequestRepository.findById(id)
                .orElseThrow(() -> new NotFoundException(EBOOK_REQUEST_NOT_FOUND));
    }
}