package qwerty.chaekit.domain.highlight.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import qwerty.chaekit.domain.highlight.entity.Highlight;

public interface HighlightJpaRepository extends JpaRepository<Highlight, Long> {

}
