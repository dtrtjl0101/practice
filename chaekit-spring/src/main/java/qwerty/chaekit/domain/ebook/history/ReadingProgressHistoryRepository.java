package qwerty.chaekit.domain.ebook.history;

import org.springframework.data.jpa.repository.JpaRepository;
import qwerty.chaekit.domain.group.activity.Activity;
import qwerty.chaekit.domain.member.user.UserProfile;

import java.time.LocalDateTime;
import java.util.List;

public interface ReadingProgressHistoryRepository extends JpaRepository<ReadingProgressHistory, Long> {
    List<ReadingProgressHistory> findByActivityAndCreatedAtBetween(Activity activity, LocalDateTime start, LocalDateTime end);
    boolean existsByActivityAndUserAndCreatedAtBetween(Activity activity, UserProfile user, LocalDateTime start, LocalDateTime end);
}
