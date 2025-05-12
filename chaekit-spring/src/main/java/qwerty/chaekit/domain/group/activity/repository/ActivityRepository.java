package qwerty.chaekit.domain.group.activity.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import qwerty.chaekit.domain.group.activity.Activity;

import java.util.List;

public interface ActivityRepository extends JpaRepository<Activity, Long> {
    List<Activity> findByGroup_Id(Long groupId);
    Page<Activity> findByGroup_Id(Long groupId, Pageable pageable);
}
