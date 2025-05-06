package qwerty.chaekit.domain.group.activity.discussion.repository;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;
import qwerty.chaekit.domain.group.activity.discussion.Discussion;

import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class DiscussionRepositoryImpl implements DiscussionRepository {
    private final DiscussionJpaRepository jpaRepository;

    @Override
    public Discussion getReferenceById(Long id) {
        return jpaRepository.getReferenceById(id);
    }

    @Override
    public boolean existsById(Long id) {
        return jpaRepository.existsById(id);
    }

    @Override
    public Optional<Discussion> findById(Long id) {
        return jpaRepository.findById(id);
    }

    @Override
    public Page<Discussion> findByActivityId(Long activityId, Pageable pageable) {
        return jpaRepository.findByActivity_Id(activityId, pageable);
    }

    @Override
    public Optional<Discussion> findByIdWithAuthorAndComments(Long id) {
        return jpaRepository.findByIdWithAuthorAndComments(id);
    }

    @Override
    public Discussion save(Discussion discussion) {
        return jpaRepository.save(discussion);
    }

    @Override
    public void delete(Discussion discussion) {
        jpaRepository.delete(discussion);
    }

}
