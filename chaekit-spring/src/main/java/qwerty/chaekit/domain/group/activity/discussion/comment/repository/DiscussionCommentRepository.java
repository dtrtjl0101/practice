package qwerty.chaekit.domain.group.activity.discussion.comment.repository;

import qwerty.chaekit.domain.group.activity.discussion.comment.DiscussionComment;
import qwerty.chaekit.domain.group.activity.discussion.comment.dto.DiscussionCommentCountDto;

import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface DiscussionCommentRepository {
    DiscussionComment getReferenceById(Long id);
    boolean existsById(Long id);
    Optional<DiscussionComment> findById(Long id);
    Optional<DiscussionComment> findByIdWithAuthor(Long id);
    Optional<DiscussionComment> findByIdWithParent(Long id);

    DiscussionComment save(DiscussionComment discussionComment);
    void delete(DiscussionComment discussionComment);


    Long countCommentsByDiscussionId(Long discussionId);
    Map<Long, DiscussionCommentCountDto> countStanceCommentsByDiscussionIds(List<Long> discussionIds);
    Map<Long, DiscussionCommentCountDto> countCommentsByDiscussionIds(List<Long> discussionIds);
    Long countByParentId(Long parentId);

}
