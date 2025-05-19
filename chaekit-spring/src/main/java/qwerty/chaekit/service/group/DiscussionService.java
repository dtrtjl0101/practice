package qwerty.chaekit.service.group;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import qwerty.chaekit.domain.group.activity.Activity;
import qwerty.chaekit.domain.group.activity.discussion.Discussion;
import qwerty.chaekit.domain.group.activity.discussion.comment.repository.DiscussionCommentRepository;
import qwerty.chaekit.domain.group.activity.discussion.repository.DiscussionRepository;
import qwerty.chaekit.domain.member.user.UserProfile;
import qwerty.chaekit.dto.group.activity.discussion.DiscussionDetailResponse;
import qwerty.chaekit.dto.group.activity.discussion.DiscussionFetchResponse;
import qwerty.chaekit.dto.group.activity.discussion.DiscussionPatchRequest;
import qwerty.chaekit.dto.group.activity.discussion.DiscussionPostRequest;
import qwerty.chaekit.dto.page.PageResponse;
import qwerty.chaekit.global.enums.ErrorCode;
import qwerty.chaekit.global.exception.BadRequestException;
import qwerty.chaekit.global.exception.NotFoundException;
import qwerty.chaekit.global.security.resolver.UserToken;
import qwerty.chaekit.mapper.DiscussionMapper;
import qwerty.chaekit.service.util.EntityFinder;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
public class DiscussionService {
    private final DiscussionRepository discussionRepository;
    private final DiscussionMapper discussionMapper;
    private final DiscussionCommentRepository discussionCommentRepository;
    private final ActivityPolicy activityPolicy;
    private final EntityFinder entityFinder;


    @Transactional(readOnly = true)
    public PageResponse<DiscussionFetchResponse> getDiscussions(UserToken userToken, Pageable pageable, Long activityId) {
        Long userId = userToken.userId();

        activityPolicy.assertJoined(userId, activityId);
        Page<Discussion> discussions = discussionRepository.findByActivityId(activityId, pageable);
        List<Long> discussionIdList = discussions.stream()
                .map(Discussion::getId)
                .toList();

        // Get the count of comments for each discussion
        Map<Long, Long> counts = discussionCommentRepository.countCommentsByDiscussionIds(discussionIdList);

        return PageResponse.of(discussions.map(discussion -> {
            Long commentCount = counts.getOrDefault(discussion.getId(), 0L);
            return discussionMapper.toFetchResponse(discussion, commentCount, userId);
        }));
    }

    public DiscussionFetchResponse createDiscussion(UserToken userToken, Long activityId, DiscussionPostRequest request) {
        UserProfile user = entityFinder.findUser(userToken.userId());
        Activity activity = entityFinder.findActivity(activityId);

        activityPolicy.assertJoined(user, activity);

        Discussion discussion = Discussion.builder()
                .activity(activity)
                .title(request.title())
                .content(request.content())
                .author(user)
                .isDebate(request.isDebate())
                .build();
        
        discussionRepository.save(discussion);

        return discussionMapper.toFetchResponse(discussion, 0L, user.getId());
    }

    @Transactional(readOnly = true)
    public DiscussionDetailResponse getDiscussionDetail(UserToken userToken, Long discussionId) {
        Long userId = userToken.userId();

        Discussion discussion = discussionRepository.findByIdWithAuthorAndComments(discussionId)
                .orElseThrow(() -> new NotFoundException(ErrorCode.DISCUSSION_NOT_FOUND));
        Long commentCount = (long) discussion.getComments().size();

        activityPolicy.assertJoined(userId, discussion.getActivity().getId());

        return discussionMapper.toDetailResponse(discussion, commentCount, userId);
    }

    public DiscussionFetchResponse updateDiscussion(UserToken userToken, Long discussionId, DiscussionPatchRequest request) {
        Long userId = userToken.userId();

        Discussion discussion = getMyDiscussion(userId, discussionId);
        Long commentCount = discussionCommentRepository.countCommentsByDiscussionId(discussion.getId());

        discussion.update(request.title(), request.content());

        return discussionMapper.toFetchResponse(discussion, commentCount, userId);
    }

    public void deleteDiscussion(UserToken userToken, Long discussionId) {
        Long userId = userToken.userId();

        Discussion discussion = getMyDiscussion(userId, discussionId);

        discussionRepository.delete(discussion);
    }

    private Discussion getMyDiscussion(Long userId, Long discussionId) {
        UserProfile user = entityFinder.findUser(userId);
        Discussion discussion = entityFinder.findDiscussion(discussionId);
        if (!discussion.isAuthor(user)) {
            throw new BadRequestException(ErrorCode.DISCUSSION_NOT_YOURS);
        }
        return discussion;
    }
}
