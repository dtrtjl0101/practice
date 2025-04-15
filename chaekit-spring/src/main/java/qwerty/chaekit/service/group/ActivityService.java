package qwerty.chaekit.service.group;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import qwerty.chaekit.domain.ebook.EbookRepository;
import qwerty.chaekit.domain.group.GroupRepository;
import qwerty.chaekit.domain.group.activity.ActivityRepository;
import qwerty.chaekit.domain.member.user.UserProfileRepository;
import qwerty.chaekit.dto.group.activity.ActivityFetchResponse;
import qwerty.chaekit.dto.group.activity.ActivityPatchRequest;
import qwerty.chaekit.dto.group.activity.ActivityPostRequest;
import qwerty.chaekit.dto.group.activity.ActivityPostResponse;
import qwerty.chaekit.dto.page.PageResponse;
import qwerty.chaekit.global.security.resolver.LoginMember;

@Service
@Transactional
@RequiredArgsConstructor
public class ActivityService {
    private final UserProfileRepository userProfileRepository;
    private final GroupRepository groupRepository;
    private final ActivityRepository activityRepository;
    private final EbookRepository ebookRepository;

    public ActivityPostResponse createActivity(LoginMember loginMember, long groupId, ActivityPostRequest request) {
        throw new RuntimeException("Not implemented yet");
    }

    public ActivityPostResponse updateActivity(LoginMember loginMember, long groupId, ActivityPatchRequest request) {
        throw new RuntimeException("Not implemented yet");
    }

    public PageResponse<ActivityFetchResponse> fetchAllActivities(Pageable pageable, long groupId) {
        throw new RuntimeException("Not implemented yet");
    }

}
