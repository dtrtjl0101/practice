package qwerty.chaekit.domain.group.activity;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ActivityRepository extends JpaRepository<Activity, Long> {
    List<Activity> findByGroup_Id(Long groupId);
    Page<Activity> findByGroup_Id(Long groupId, Pageable pageable);
}
