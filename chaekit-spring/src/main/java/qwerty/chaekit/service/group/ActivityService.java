package qwerty.chaekit.service.group;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import qwerty.chaekit.domain.ebook.EbookJpaRepository;
import qwerty.chaekit.domain.ebook.EbookRepository;
import qwerty.chaekit.domain.group.GroupRepository;
import qwerty.chaekit.domain.group.ReadingGroup;
import qwerty.chaekit.domain.group.activity.Activity;
import qwerty.chaekit.domain.group.activity.ActivityRepository;
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
import qwerty.chaekit.global.security.resolver.UserToken;

import java.time.LocalDate;

@Service
@Transactional
@RequiredArgsConstructor
public class ActivityService {
    private final UserProfileRepository userRepository;
    private final GroupRepository groupRepository;
    private final ActivityRepository activityRepository;
    private final EbookRepository ebookRepository;
    //private final EbookJpaRepository ebookJpaRepository;

    public ActivityPostResponse createActivity(UserToken userToken, long groupId, ActivityPostRequest request) {
        Long userId = userToken.userId();
        // 1. 로그인한 사용자의 프로필을 확인한다.
        if(!userRepository.existsById(userId)){
            throw new NotFoundException(ErrorCode.USER_NOT_FOUND);
        }

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
        if (!group.getGroupLeader().getId().equals(userId)) {
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

    public ActivityPostResponse updateActivity(UserToken userToken, long groupId, ActivityPatchRequest request) {
        Long userId = userToken.userId();
        // 1. 로그인한 사용자의 프로필을 확인한다.
        if(!userRepository.existsById(userId)){
            throw new NotFoundException(ErrorCode.USER_NOT_FOUND);
        }

        // 2. 그룹 조회
        ReadingGroup group = groupRepository.findById(groupId)
                .orElseThrow(() -> new NotFoundException(ErrorCode.GROUP_NOT_FOUND));

        // 3. 활동 조회 및 그룹 일치 검증
        Activity activity = activityRepository.findById(request.activityId())
                .orElseThrow(() -> new NotFoundException(ErrorCode.ACTIVITY_NOT_FOUND));

        if (!activity.getGroup().getId().equals(groupId)) {
            throw new ForbiddenException(ErrorCode.ACTIVITY_GROUP_MISMATCH);
        }

        // 4. 모임장 권한 확인
        if (!group.getGroupLeader().getId().equals(userId)) {
            throw new ForbiddenException(ErrorCode.GROUP_LEADER_ONLY);
        }

        // 5. 시간 유효성 검증
        LocalDate startTime = request.startTime() != null ? request.startTime() : activity.getStartTime();
        LocalDate endTime = request.endTime() != null ? request.endTime() : activity.getEndTime();

        if (startTime.isAfter(endTime)) {
            throw new BadRequestException(ErrorCode.ACTIVITY_TIME_INVALID);
        }

        // 6. 중복 시간 체크 (자기 자신 제외)
        activityRepository.findByGroup_Id(groupId).stream()
                .filter(a -> !a.getId().equals(activity.getId()))
                .forEach(a -> {
                    boolean isBefore = endTime.isBefore(a.getStartTime());
                    boolean isAfter = startTime.isAfter(a.getEndTime());
                    if (!(isBefore || isAfter)) {
                        throw new BadRequestException(ErrorCode.ACTIVITY_TIME_CONFLICT);
                    }
                });

        // 7. 수정 적용
        activity.updateTime(startTime, endTime);
        activity.updateDescription(request.description());

        return ActivityPostResponse.of(activity);
    }

    public PageResponse<ActivityFetchResponse> fetchAllActivities(Pageable pageable, long groupId) {
        Page<ActivityFetchResponse> page = activityRepository.findByGroup_Id(groupId, pageable)
                .map(ActivityFetchResponse::of);
        return PageResponse.of(page);
    }
}
