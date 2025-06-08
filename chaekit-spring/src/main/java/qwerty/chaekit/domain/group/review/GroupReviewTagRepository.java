package qwerty.chaekit.domain.group.review;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import qwerty.chaekit.domain.group.ReadingGroup;
import qwerty.chaekit.dto.group.review.TagStatDto;

import java.util.List;

public interface GroupReviewTagRepository extends JpaRepository<GroupReviewTagRelation, Long> {

    @Query("""
        SELECT new qwerty.chaekit.dto.group.review.TagStatDto(r.tag, COUNT(r))
        FROM GroupReviewTagRelation r
        WHERE r.review.group = :group
        GROUP BY r.tag
        """)
    List<TagStatDto> countTagsByGroupId(ReadingGroup group);
}