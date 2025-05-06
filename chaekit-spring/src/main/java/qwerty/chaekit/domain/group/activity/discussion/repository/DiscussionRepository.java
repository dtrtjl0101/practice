package qwerty.chaekit.domain.group.activity.discussion.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import qwerty.chaekit.domain.group.activity.discussion.Discussion;

import java.util.Optional;

public interface DiscussionRepository {
    Discussion getReferenceById(Long id);
    boolean existsById(Long id);
    Optional<Discussion> findById(Long id);
    Page<Discussion> findByActivityId(Long activityId, Pageable pageable);
    Optional<Discussion> findByIdWithAuthorAndComments(Long id);
    Discussion save(Discussion discussion);
    void delete(Discussion discussion);
}
