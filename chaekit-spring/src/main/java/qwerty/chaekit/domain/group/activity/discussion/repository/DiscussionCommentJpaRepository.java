package qwerty.chaekit.domain.group.activity.discussion.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import qwerty.chaekit.domain.group.activity.discussion.DiscussionComment;

public interface DiscussionCommentJpaRepository extends JpaRepository<DiscussionComment, Long> {
    Long countByDiscussion_Id(Long discussionId);
}
