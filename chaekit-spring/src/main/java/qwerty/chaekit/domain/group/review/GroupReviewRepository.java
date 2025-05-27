package qwerty.chaekit.domain.group.review;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import qwerty.chaekit.domain.group.activity.Activity;
import qwerty.chaekit.domain.member.user.UserProfile;

import java.util.Optional;

public interface GroupReviewRepository extends JpaRepository<GroupReview, Long> {
    Optional<GroupReview> findByActivityAndAuthor(Activity activity, UserProfile author);

    Page<GroupReview> findByGroupId(Long groupId, Pageable pageable);
}
