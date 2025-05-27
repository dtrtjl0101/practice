package qwerty.chaekit.service.group;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import qwerty.chaekit.domain.group.ReadingGroup;
import qwerty.chaekit.domain.group.activity.Activity;
import qwerty.chaekit.domain.group.activity.activitymember.ActivityMemberRepository;
import qwerty.chaekit.domain.group.review.GroupReview;
import qwerty.chaekit.domain.group.review.GroupReviewRepository;
import qwerty.chaekit.domain.member.user.UserProfile;
import qwerty.chaekit.dto.group.review.GroupReviewFetchResponse;
import qwerty.chaekit.dto.group.review.GroupReviewPostRequest;
import qwerty.chaekit.dto.page.PageResponse;
import qwerty.chaekit.global.enums.ErrorCode;
import qwerty.chaekit.global.exception.BadRequestException;
import qwerty.chaekit.global.security.resolver.UserToken;
import qwerty.chaekit.mapper.GroupReviewMapper;
import qwerty.chaekit.service.util.EntityFinder;

@Service
@Transactional
@RequiredArgsConstructor
public class GroupReviewService {
    private final GroupReviewRepository groupReviewRepository;
    private final EntityFinder entityFinder;
    private final GroupReviewMapper groupReviewMapper;
    private final ActivityMemberRepository activityMemberRepository;
    private final ActivityPolicy activityPolicy;

    public GroupReviewFetchResponse createReview(
            UserToken userToken, Long groupId, GroupReviewPostRequest request
    ) {
        UserProfile author = entityFinder.findUser(userToken.userId());
        ReadingGroup group = entityFinder.findGroup(groupId);
        Activity activity = entityFinder.findActivity(request.activityId());
        
        if (!activity.isFromGroup(group)) {
            throw new BadRequestException(ErrorCode.ACTIVITY_GROUP_MISMATCH);
        }
        
        activityPolicy.assertJoined(author, activity);

        GroupReview review = groupReviewRepository.findByActivityAndAuthor(activity, author)
                .map(existing -> {
                    // 기존 리뷰 수정
                    existing.setContent(request.content());
                    existing.setTags(request.tags());
                    return existing;
                })
                .orElseGet(() -> {
                    // 신규 리뷰 생성
                    GroupReview newReview = GroupReview.builder()
                            .group(group)
                            .author(author)
                            .activity(activity)
                            .content(request.content())
                            .build();
                    newReview.setTags(request.tags());
                    return newReview;
                });

        // 저장 (기존 리뷰라면 dirty checking, 새 리뷰라면 persist)
        groupReviewRepository.save(review);

        return groupReviewMapper.toFetchResponse(review);
    }
    
    public PageResponse<GroupReviewFetchResponse> getReviews(
            Long groupId, Pageable pageable
    ) {
        Page<GroupReviewFetchResponse> reviews = groupReviewRepository.findByGroupId(groupId, pageable)
                .map(groupReviewMapper::toFetchResponse);
        
        return PageResponse.of(reviews);
    }
}
