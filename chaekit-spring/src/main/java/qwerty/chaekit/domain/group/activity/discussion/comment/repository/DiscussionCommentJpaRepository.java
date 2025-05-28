package qwerty.chaekit.domain.group.activity.discussion.comment.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import qwerty.chaekit.domain.group.activity.discussion.comment.DiscussionComment;

import java.util.Optional;

public interface DiscussionCommentJpaRepository extends JpaRepository<DiscussionComment, Long> {
    Long countByDiscussion_Id(Long discussionId);
    @Query("SELECT c FROM DiscussionComment c JOIN FETCH c.author WHERE c.id = :id")
    Optional<DiscussionComment> findByIdWithAuthor(Long id);

    Long countByParent_Id(Long parentId);

    @Query("""
           SELECT c FROM DiscussionComment c
           LEFT JOIN FETCH c.replies
           LEFT JOIN FETCH c.parent
           WHERE c.id = :id
           """)
    Optional<DiscussionComment> findByIdWithRepliesAndParent(Long id);
}
