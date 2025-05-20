package qwerty.chaekit.service.group;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import qwerty.chaekit.domain.group.activity.discussion.Discussion;
import qwerty.chaekit.domain.group.activity.discussion.DiscussionStance;
import qwerty.chaekit.domain.group.activity.discussion.comment.DiscussionComment;
import qwerty.chaekit.domain.group.activity.discussion.comment.repository.DiscussionCommentRepository;
import qwerty.chaekit.domain.member.user.UserProfile;
import qwerty.chaekit.dto.group.activity.discussion.DiscussionCommentFetchResponse;
import qwerty.chaekit.dto.group.activity.discussion.DiscussionCommentPatchRequest;
import qwerty.chaekit.dto.group.activity.discussion.DiscussionCommentPostRequest;
import qwerty.chaekit.global.enums.ErrorCode;
import qwerty.chaekit.global.exception.BadRequestException;
import qwerty.chaekit.global.exception.NotFoundException;
import qwerty.chaekit.global.security.resolver.UserToken;
import qwerty.chaekit.mapper.DiscussionMapper;
import qwerty.chaekit.service.notification.NotificationService;
import qwerty.chaekit.service.util.EntityFinder;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class DiscussionCommentService {
    private final DiscussionCommentRepository discussionCommentRepository;
    private final ActivityPolicy activityPolicy;
    private final DiscussionMapper discussionMapper;
    private final NotificationService notificationService;
    private final EntityFinder entityFinder;
    
    public DiscussionCommentFetchResponse getComment(UserToken userToken, Long commentId) {
        DiscussionComment comment = discussionCommentRepository.findByIdWithAuthor(commentId)
                .orElseThrow(() -> new NotFoundException(ErrorCode.DISCUSSION_COMMENT_NOT_FOUND));
        activityPolicy.assertJoined(userToken.userId(), comment.getDiscussion().getActivity().getId());
        return discussionMapper.toCommentFetchResponse(comment);
    }

    public DiscussionCommentFetchResponse addComment(Long discussionId, DiscussionCommentPostRequest request, UserToken userToken) {
        UserProfile user = entityFinder.findUser(userToken.userId());
        Discussion discussion = entityFinder.findDiscussion(discussionId);
        String content = request.content();
        DiscussionStance stance = request.stance();
        
        activityPolicy.assertJoined(user, discussion.getActivity());

        DiscussionComment parentComment;
        boolean isReply = request.parentId() != null;
        if (isReply) {
            parentComment = entityFinder.findDiscussionComment(request.parentId());
            if (parentComment.isReply()){
                throw new BadRequestException(ErrorCode.REPLY_CANNOT_HAVE_CHILD);
            }
            if (parentComment.isDeleted()){
                throw new BadRequestException(ErrorCode.DISCUSSION_COMMENT_DELETED);
            }
        } else {
            parentComment = null;
        }

        DiscussionComment comment = DiscussionComment.builder()
                .author(user)
                .discussion(discussion)
                .content(content)
                .stance(stance)
                .parent(parentComment)
                .build();
        discussionCommentRepository.save(comment);

        if (parentComment != null && !parentComment.isAuthor(user)) {
            notificationService.createCommentReplyNotification(parentComment.getAuthor(), user,parentComment);
        } else {
            if (!discussion.isAuthor(user)) {
                notificationService.createDiscussionCommentNotification(discussion.getAuthor(), user, discussion);
            }
            // TODO: 이 루프에서 c.getAuthor().getNickname() 접근 시 N+1 쿼리 발생 가능성 있음.
            // 필요 시 discussion.getComments() 조회 시 fetch join 적용 고려
            discussion.getComments().stream()
                    .filter(c -> !c.isDeleted() && c.isRootComment() && !c.isAuthor(user))
                    .forEach(c -> notificationService.createDiscussionCommentNotification(c.getAuthor(), user, discussion));
        }

        return discussionMapper.toCommentFetchResponse(comment);
    }

    public DiscussionCommentFetchResponse updateComment(Long commentId, DiscussionCommentPatchRequest request, UserToken userToken) {
        UserProfile user = entityFinder.findUser(userToken.userId());
        DiscussionComment comment = entityFinder.findDiscussionComment(commentId);

        if (comment.isDeleted()) {
            throw new BadRequestException(ErrorCode.DISCUSSION_COMMENT_DELETED);
        }
        if (!comment.isAuthor(user)) {
            throw new BadRequestException(ErrorCode.DISCUSSION_COMMENT_NOT_YOURS);
        }
        comment.updateContent(request.content());
        return discussionMapper.toCommentFetchResponse(comment);
    }

    public void deleteComment(Long commentId, UserToken userToken) {
        UserProfile user = entityFinder.findUser(userToken.userId());
        DiscussionComment comment = entityFinder.findDiscussionComment(commentId);

        if (!comment.isAuthor(user)) {
            throw new BadRequestException(ErrorCode.DISCUSSION_COMMENT_NOT_YOURS);
        }

        if (comment.isRootComment()) {
            if (hasReplies(comment)) {
                if(comment.isDeleted()) {
                    throw new BadRequestException(ErrorCode.DISCUSSION_COMMENT_DELETED);
                }
                comment.softDelete();
            } else {
                removeRootComment(comment);
            }
        } else {
            DiscussionComment parentComment = comment.getParent();
            if (parentComment.isDeleted() && hasLastReply(parentComment)) {
                removeRootComment(parentComment);
            }
            parentComment.removeReply(comment);
        }
    }

    private boolean hasReplies(DiscussionComment comment) {
        return discussionCommentRepository.countByParentId(comment.getId()) > 0;
    }

    private boolean hasLastReply(DiscussionComment comment) {
        return discussionCommentRepository.countByParentId(comment.getId()) == 1;
    }

    private void removeRootComment(DiscussionComment comment) {
        discussionCommentRepository.delete(comment);
    }
}
