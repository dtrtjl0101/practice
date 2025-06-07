package qwerty.chaekit.service.group;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import qwerty.chaekit.domain.ebook.Ebook;
import qwerty.chaekit.domain.group.ReadingGroup;
import qwerty.chaekit.domain.group.activity.Activity;
import qwerty.chaekit.domain.group.activity.activitymember.ActivityMember;
import qwerty.chaekit.domain.group.activity.activitymember.ActivityMemberRepository;
import qwerty.chaekit.domain.group.activity.repository.ActivityRepository;
import qwerty.chaekit.domain.member.user.UserProfile;
import qwerty.chaekit.dto.group.activity.*;
import qwerty.chaekit.dto.page.PageResponse;
import qwerty.chaekit.global.enums.ErrorCode;
import qwerty.chaekit.global.exception.ForbiddenException;
import qwerty.chaekit.global.exception.NotFoundException;
import qwerty.chaekit.global.security.resolver.UserToken;
import qwerty.chaekit.service.ebook.EbookPolicy;
import qwerty.chaekit.service.util.EntityFinder;
import qwerty.chaekit.service.util.FileService;

import java.time.LocalDate;
import java.util.Optional;

@Service
@Transactional
@RequiredArgsConstructor
public class ActivityService {
    private final ActivityRepository activityRepository;
    private final ActivityMemberRepository activityMemberRepository;

    private final ActivityPolicy activityPolicy;
    private final EntityFinder entityFinder;
    private final EbookPolicy ebookPolicy;
    private final FileService fileService;

    public ActivityPostResponse createActivity(UserToken userToken, long groupId, ActivityPostRequest request) {
        UserProfile user = entityFinder.findUser(userToken.userId());
        ReadingGroup group = entityFinder.findGroup(groupId);
        Ebook ebook = entityFinder.findEbook(request.bookId());

        if (!group.isLeader(user)) {
            throw new ForbiddenException(ErrorCode.GROUP_LEADER_ONLY);
        }

        activityPolicy.assertActivityPeriodValid(groupId, null, request.startTime(), request.endTime());
        ebookPolicy.assertEBookPurchased(user, ebook);

        Activity saved = activityRepository.save(
                Activity.builder()
                    .group(group)
                    .book(ebook)
                    .startTime(request.startTime())
                    .endTime(request.endTime())
                    .description(request.description())
                    .build()
        );
        saved.addParticipant(user);
        return ActivityPostResponse.of(saved);
    }

    public ActivityPostResponse updateActivity(UserToken userToken, long groupId, ActivityPatchRequest request) {
        UserProfile user = entityFinder.findUser(userToken.userId());
        ReadingGroup group = entityFinder.findGroup(groupId);
        Activity activity = entityFinder.findActivity(request.activityId());

        if (!activity.isFromGroup(group)) {
            throw new ForbiddenException(ErrorCode.ACTIVITY_GROUP_MISMATCH);
        }
        
        if (!group.isLeader(user)) {
            throw new ForbiddenException(ErrorCode.GROUP_LEADER_ONLY);
        }
        
        LocalDate newStartTime = Optional.ofNullable(request.startTime())
                .orElse(activity.getStartTime());
        LocalDate newEndTime = Optional.ofNullable(request.endTime())
                .orElse(activity.getEndTime());

        activityPolicy.assertActivityPeriodValid(groupId, activity.getId(), newStartTime, newEndTime);
        
        activity.updateTime(newStartTime, newEndTime);
        activity.updateDescription(request.description());

        return ActivityPostResponse.of(activity);
    }

    @Transactional(readOnly = true)
    public PageResponse<ActivityFetchResponse> fetchAllActivities(UserToken userToken, Pageable pageable, long groupId) {
        Long userId = userToken.userId();
        Page<ActivityFetchResponse> page = activityRepository.findByGroup_IdWithBook(groupId, pageable)
                .map(
                        activity -> ActivityFetchResponse.of(
                                activity, 
                                fileService.convertToPublicImageURL(activity.getBook().getCoverImageKey()),
                                userId != null && activity.isParticipant(entityFinder.findUser(userId))
                ));
        return PageResponse.of(page);
    }
    
    public void joinActivity(UserToken userToken, long activityId) {
        UserProfile user = entityFinder.findUser(userToken.userId());
        Activity activity = entityFinder.findActivity(activityId);
        
        activityPolicy.assertJoinable(user, activity);
        
        activity.addParticipant(user);
    }
 
    public void leaveActivity(UserToken userToken, long activityId) {
        UserProfile user = entityFinder.findUser(userToken.userId());
        Activity activity = entityFinder.findActivity(activityId);
        
        if (!activity.isParticipant(user)) {
            throw new ForbiddenException(ErrorCode.ACTIVITY_NOT_JOINED);
        }
        
        activity.removeParticipant(user);
    }

    @Transactional(readOnly = true)
    public ActivityFetchResponse fetchActivity(UserToken userToken, long activityId) {
        Long userId = userToken.userId();
        Activity activity = activityRepository.findByIdWithBook(activityId)
                .orElseThrow(() -> new NotFoundException(ErrorCode.ACTIVITY_NOT_FOUND));

        activityPolicy.assertJoined(userId, activity.getId());

        return ActivityFetchResponse.of(activity, fileService.convertToPublicImageURL(activity.getBook().getCoverImageKey()), true);
    }

    @Transactional(readOnly = true)
    public PageResponse<ActivityFetchResponse> getMyActivities(UserToken userToken, Long bookId, Pageable pageable) {
        UserProfile user = entityFinder.findUser(userToken.userId());
        Page<ActivityMember> fetchResults;
        if (bookId == null) {
            fetchResults = activityMemberRepository.findByUser(user, pageable);
        } else {
            Ebook book = entityFinder.findEbook(bookId);
            fetchResults = activityMemberRepository.findByUserAndActivity_Book(user, book, pageable);
        }
        Page<ActivityFetchResponse> page = fetchResults
                .map(activityMember -> ActivityFetchResponse.of(
                        activityMember.getActivity(),
                        fileService.convertToPublicImageURL(activityMember.getUser().getProfileImageKey()),
                        true
                ));
        return PageResponse.of(page);

    }
    
    @Transactional(readOnly = true)
    public PageResponse<ActivityScoreResponse> getActivityTop5Scores(long activityId) {
        Page<ActivityScoreResponse> page = activityRepository.calculateActivityScores(
                activityId, PageRequest.of(0, 5))
                .map(score -> ActivityScoreResponse.builder()
                        .userId(score.user().getId())
                        .score(score.score())
                        .userProfileImageURL(fileService.convertToPublicImageURL(score.user().getProfileImageKey()))
                        .userNickname(score.user().getNickname())
                        .build()
                );
        
        return PageResponse.of(page);
    }
}
