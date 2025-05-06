package qwerty.chaekit.service.group;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import qwerty.chaekit.domain.group.activity.ActivityRepository;
import qwerty.chaekit.domain.group.activity.discussion.Discussion;
import qwerty.chaekit.domain.group.activity.discussion.DiscussionComment;
import qwerty.chaekit.domain.group.activity.discussion.comment.DiscussionCommentRepository;
import qwerty.chaekit.domain.group.activity.discussion.repository.DiscussionRepository;
import qwerty.chaekit.domain.member.user.UserProfile;
import qwerty.chaekit.domain.member.user.UserProfileRepository;
import qwerty.chaekit.dto.group.activity.discussion.*;
import qwerty.chaekit.dto.page.PageResponse;
import qwerty.chaekit.global.enums.ErrorCode;
import qwerty.chaekit.global.exception.BadRequestException;
import qwerty.chaekit.global.exception.NotFoundException;
import qwerty.chaekit.global.security.resolver.UserToken;
import qwerty.chaekit.mapper.DiscussionMapper;

import java.util.List;
import java.util.Map;

// TODO: 모든 메서드에서 activity 참여중인지 권한 확인 필요(특히, GET, POST 메서드)

@Service
@RequiredArgsConstructor
@Transactional
public class DiscussionService {
    private final DiscussionRepository discussionRepository;
    private final DiscussionMapper discussionMapper;
    private final ActivityRepository activityRepository;
    private final UserProfileRepository userRepository;
    private final DiscussionCommentRepository discussionCommentRepository;


    public PageResponse<DiscussionFetchResponse> getDiscussions(UserToken userToken, Pageable pageable, Long activityId) {
        Long userId = userToken.userId();

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
        if(!activityRepository.existsById(activityId)) {
            throw new NotFoundException(ErrorCode.ACTIVITY_NOT_FOUND);
        }

        UserProfile user = userRepository.findById(userToken.userId())
                .orElseThrow(() -> new NotFoundException(ErrorCode.USER_NOT_FOUND));

        Discussion discussion = Discussion.builder()
                .activity(activityRepository.getReferenceById(activityId))
                .title(request.title())
                .content(request.content())
                .author(user)
                .isDebate(request.isDebate())
                .build();


        discussionRepository.save(discussion);

        return discussionMapper.toFetchResponse(discussion, 0L, user.getId());
    }

    public DiscussionDetailResponse getDiscussionDetail(UserToken userToken, Long discussionId) {
        Long userId = userToken.userId();

        Discussion discussion = discussionRepository.findByIdWithAuthorAndComments(discussionId)
                .orElseThrow(() -> new NotFoundException(ErrorCode.DISCUSSION_NOT_FOUND));
        Long commentCount = discussionCommentRepository.countCommentsByDiscussionId(discussion.getId());

        return discussionMapper.toDetailResponse(discussion, commentCount, userId);
    }

    public DiscussionFetchResponse updateDiscussion(UserToken userToken, Long discussionId, DiscussionPatchRequest request) {
        Long userId = userToken.userId();

        Discussion discussion = getMyDiscussion(discussionId, userId);
        Long commentCount = discussionCommentRepository.countCommentsByDiscussionId(discussion.getId());

        discussion.update(request.title(), request.content(), request.isDebate());

        return discussionMapper.toFetchResponse(discussion, commentCount, userId);
    }

    public void deleteDiscussion(UserToken userToken, Long discussionId) {
        Long userId = userToken.userId();

        Discussion discussion = getMyDiscussion(discussionId, userId);

        discussionRepository.delete(discussion);
    }

    private Discussion getMyDiscussion(Long discussionId, Long userId) {
        Discussion discussion = discussionRepository.findById(discussionId)
                .orElseThrow(() -> new NotFoundException(ErrorCode.DISCUSSION_NOT_FOUND));
        if (!discussion.getAuthor().getId().equals(userId)) {
            throw new BadRequestException(ErrorCode.DISCUSSION_NOT_YOURS);
        }
        return discussion;
    }

    public DiscussionCommentFetchResponse getComment(Long commentId) {
        DiscussionComment comment = discussionCommentRepository.findByIdWithAuthor(commentId)
                .orElseThrow(() -> new NotFoundException(ErrorCode.DISCUSSION_COMMENT_NOT_FOUND));
        return discussionMapper.toCommentFetchResponse(comment);
    }

    public DiscussionCommentFetchResponse addComment(Long discussionId, DiscussionCommentPostRequest request, UserToken userToken) {
        if(!discussionRepository.existsById(discussionId)){
            throw new NotFoundException(ErrorCode.DISCUSSION_NOT_FOUND);
        }

        DiscussionComment parentComment;
        if(request.parentId() != null){
            DiscussionComment comment = discussionCommentRepository.findById(request.parentId())
                    .orElseThrow(() -> new NotFoundException(ErrorCode.DISCUSSION_COMMENT_NOT_FOUND));
            if(comment.getParent() != null){
                throw new BadRequestException(ErrorCode.INVALID_COMMENT_PARENT);
            }
            parentComment = discussionCommentRepository.getReferenceById(request.parentId());
        } else {
            parentComment = null;
        }

        DiscussionComment comment = DiscussionComment.builder()
                .author(userRepository.getReferenceById(userToken.userId()))
                .discussion(discussionRepository.getReferenceById(discussionId))
                .content(request.content())
                .parent(parentComment)
                .stance(request.stance())
                .build();
        discussionCommentRepository.save(comment);
        return discussionMapper.toCommentFetchResponse(comment);
    }

    public DiscussionCommentFetchResponse updateComment(Long commentId, DiscussionCommentPatchRequest request, UserToken userToken) {
        DiscussionComment comment = discussionCommentRepository.findByIdWithAuthor(commentId)
                .orElseThrow(() -> new NotFoundException(ErrorCode.DISCUSSION_COMMENT_NOT_FOUND));
        if (!comment.getAuthor().getId().equals(userToken.userId())) {
            throw new BadRequestException(ErrorCode.DISCUSSION_COMMENT_NOT_YOURS);
        }
        comment.updateContent(request.content());
        return discussionMapper.toCommentFetchResponse(comment);
    }

    public void deleteComment(Long commentId, UserToken userToken) {
        DiscussionComment comment = discussionCommentRepository.findByIdWithParent(commentId)
                .orElseThrow(() -> new NotFoundException(ErrorCode.DISCUSSION_COMMENT_NOT_FOUND));

        if (!comment.getAuthor().getId().equals(userToken.userId())) {
            throw new BadRequestException(ErrorCode.DISCUSSION_COMMENT_NOT_YOURS);
        }

        // 대댓글이 있는 경우 soft delete
        Long repliesCount = discussionCommentRepository.countByParentId(commentId);
        if (repliesCount > 0) {
            comment.softDelete();
            return;
        }

        // 마지막 답글인 경우 부모 댓글도 삭제
        if (comment.getParent() != null && comment.getParent().isDeleted()) {
            long siblingCount = discussionCommentRepository.countByParentId(comment.getParent().getId());
            if (siblingCount == 1) {
                discussionCommentRepository.delete(comment);
                discussionCommentRepository.delete(comment.getParent());
                return;
            }
        }

        discussionCommentRepository.delete(comment);
    }
}
