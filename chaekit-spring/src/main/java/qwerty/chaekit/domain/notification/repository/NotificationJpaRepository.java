package qwerty.chaekit.domain.notification.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import qwerty.chaekit.domain.member.user.UserProfile;
import qwerty.chaekit.domain.notification.entity.Notification;

public interface NotificationJpaRepository extends JpaRepository<Notification, Long> {
    Page<Notification> findByReceiverOrderByCreatedAtDesc(UserProfile receiver, Pageable pageable);
} 