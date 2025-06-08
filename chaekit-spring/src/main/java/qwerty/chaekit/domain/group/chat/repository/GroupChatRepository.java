package qwerty.chaekit.domain.group.chat.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import qwerty.chaekit.domain.group.ReadingGroup;
import qwerty.chaekit.domain.group.chat.GroupChat;

public interface GroupChatRepository extends JpaRepository<GroupChat, Long> {
    Page<GroupChat> findByGroupOrderByCreatedAtDesc(ReadingGroup group, Pageable pageable);
}