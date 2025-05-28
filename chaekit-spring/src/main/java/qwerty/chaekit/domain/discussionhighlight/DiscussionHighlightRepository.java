package qwerty.chaekit.domain.discussionhighlight;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import qwerty.chaekit.domain.highlight.entity.Highlight;

import java.util.List;

public interface DiscussionHighlightRepository extends JpaRepository<DiscussionHighlight, Long> {
    @Query("SELECT dh FROM DiscussionHighlight dh JOIN FETCH dh.discussion WHERE dh.highlight.id IN :highlightIds")
    List<DiscussionHighlight> findByHighlightIdIn(List<Long> highlightIds);

    List<DiscussionHighlight> findByHighlight(Highlight highlight);
}
