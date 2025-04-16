package qwerty.chaekit.service.group;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import qwerty.chaekit.domain.ebook.EbookRepository;
import qwerty.chaekit.domain.group.GroupRepository;
import qwerty.chaekit.domain.group.ReadingGroup;
import qwerty.chaekit.domain.group.activity.Activity;
import qwerty.chaekit.domain.group.activity.ActivityRepository;
import qwerty.chaekit.domain.member.user.UserProfile;
import qwerty.chaekit.domain.member.user.UserProfileRepository;
import qwerty.chaekit.dto.group.activity.ActivityFetchResponse;
import qwerty.chaekit.dto.group.activity.ActivityPatchRequest;
import qwerty.chaekit.dto.group.activity.ActivityPostRequest;
import qwerty.chaekit.dto.group.activity.ActivityPostResponse;
import qwerty.chaekit.dto.page.PageResponse;
import qwerty.chaekit.global.enums.ErrorCode;
import qwerty.chaekit.global.exception.BadRequestException;
import qwerty.chaekit.global.exception.ForbiddenException;
import qwerty.chaekit.global.exception.NotFoundException;
import qwerty.chaekit.global.security.resolver.LoginMember;

@Service
@Transactional
@RequiredArgsConstructor
public class ActivityService {
    private final UserProfileRepository userRepository;
    private final GroupRepository groupRepository;
    private final ActivityRepository activityRepository;
    private final EbookRepository ebookRepository;

    public ActivityPostResponse createActivity(LoginMember loginMember, long groupId, ActivityPostRequest request) {
        // 1. 로그인한 사용자의 프로필을 가져온다.
        UserProfile userProfile = userRepository.findByMember_Id(loginMember.memberId())
                .orElseThrow(() -> new NotFoundException(ErrorCode.USER_NOT_FOUND));

        // 2. 모임을 가져온다.
        ReadingGroup group = groupRepository.findById(groupId)
                .orElseThrow(() -> new NotFoundException(ErrorCode.GROUP_NOT_FOUND));

        // 3. 전자책이 존재하는지 확인한다.
        if(!ebookRepository.existsById(request.bookId())){
            throw new NotFoundException(ErrorCode.EBOOK_NOT_FOUND);
        }
        // 4. 활동이 겹치지 않는 지 확인한다.
        if(request.startTime().isAfter(request.endTime())) {
            throw new BadRequestException(ErrorCode.ACTIVITY_TIME_INVALID);
        }

        activityRepository.findByGroup_Id(groupId)
                .forEach(activity -> {
                    boolean isBefore = request.endTime().isBefore(activity.getStartTime());
                    boolean isAfter = request.startTime().isAfter(activity.getEndTime());

                    if (!(isBefore || isAfter)) {
                        throw new BadRequestException(ErrorCode.ACTIVITY_TIME_CONFLICT);
                    }
                });
        // 5. 모임지기가 맞는지 확인한다.
        if (!group.getGroupLeader().equals(userProfile)) {
            throw new ForbiddenException(ErrorCode.GROUP_LEADER_ONLY);
        }

        Activity saved = activityRepository.save(Activity.builder()
                .group(groupRepository.getReferenceById(groupId))
                .book(ebookRepository.getReferenceById(request.bookId()))
                .startTime(request.startTime())
                .endTime(request.endTime())
                .description(request.description())
                .build());
        return ActivityPostResponse.of(saved);
    }

    public ActivityPostResponse updateActivity(LoginMember loginMember, long groupId, ActivityPatchRequest request) {
        throw new RuntimeException("Not implemented yet");
    }

    public PageResponse<ActivityFetchResponse> fetchAllActivities(Pageable pageable, long groupId) {
        throw new RuntimeException("Not implemented yet");
    }

}
