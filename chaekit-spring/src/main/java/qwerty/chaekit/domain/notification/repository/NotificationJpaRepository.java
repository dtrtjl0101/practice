package qwerty.chaekit.domain.notification.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
//import qwerty.chaekit.domain.member.publisher.PublisherProfile;
import qwerty.chaekit.domain.member.user.UserProfile;
import qwerty.chaekit.domain.notification.entity.Notification;
import qwerty.chaekit.domain.notification.entity.NotificationType;

public interface NotificationJpaRepository extends JpaRepository<Notification, Long> {
    Page<Notification> findByReceiverOrderByCreatedAtDesc(UserProfile receiver, Pageable pageable);
    Page<Notification> findByReceiverId(Long receiverId, Pageable pageable);
    //Page<Notification> findByPublisherOrderByCreatedAtDesc(PublisherProfile publisher, Pageable pageable);
    Page<Notification> findByTypeAndReceiverIsNull(NotificationType type, Pageable pageable);
    Page<Notification> findByHighlightId(Long highlightId, Pageable pageable);
} 