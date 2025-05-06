package qwerty.chaekit.domain.group.activity.discussion.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import qwerty.chaekit.domain.group.activity.discussion.Discussion;

import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface DiscussionRepository {
    Page<Discussion> findByActivityId(Long activityId, Pageable pageable);
    Map<Long, Long> countCommentsByDiscussionIds(List<Long> discussionIds);
    Optional<Discussion> findById(Long id);
    Discussion save(Discussion discussion);
    Long countCommentsByDiscussionId(Long discussionId);
    Optional<Discussion> findByIdWithAuthorAndComments(Long id);
    void delete(Discussion discussion);
}
