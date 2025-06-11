package qwerty.chaekit.service.member.user;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import qwerty.chaekit.domain.group.activity.Activity;
import qwerty.chaekit.domain.group.activity.repository.ActivityRepository;
import qwerty.chaekit.domain.member.user.UserProfile;
import qwerty.chaekit.domain.member.user.UserProfileRepository;
import qwerty.chaekit.dto.member.UserInfoResponse;
import qwerty.chaekit.dto.member.UserPatchRequest;
import qwerty.chaekit.global.enums.ErrorCode;
import qwerty.chaekit.global.exception.BadRequestException;
import qwerty.chaekit.global.exception.NotFoundException;
import qwerty.chaekit.global.security.resolver.UserToken;
import qwerty.chaekit.service.util.FileService;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class UserService {
    private final UserProfileRepository userRepository;
    private final FileService fileService;
    private final ActivityRepository activityRepository;

    @Transactional(readOnly = true)
    public UserInfoResponse getUserProfile(UserToken userToken) {
        UserProfile user = userRepository.findById(userToken.userId())
                .orElseThrow(() -> new NotFoundException(ErrorCode.USER_NOT_FOUND));
        String imageURL = fileService.convertToPublicImageURL(user.getProfileImageKey());

        Activity activity = activityRepository.findRecentActivityByUserId(user.getId(), PageRequest.of(0, 1, Sort.by("createdAt").descending()))
                .stream().findFirst().orElse(null);


        return UserInfoResponse.of(
                user, 
                imageURL, 
                activity,
                activity == null ? null : fileService.convertToPublicImageURL(activity.getGroup().getGroupImageKey()),
                activity == null ? null : fileService.convertToPublicImageURL(activity.getBook().getCoverImageKey())
                );
    }
    
    public UserInfoResponse updateUserProfile(UserToken userToken, UserPatchRequest request) {
        UserProfile user = userRepository.findById(userToken.userId())
                .orElseThrow(() -> new NotFoundException(ErrorCode.USER_NOT_FOUND));
        
        if(request.nickname() != null && !request.nickname().isBlank()) {
            if (userRepository.existsByNickname(request.nickname())) {
                throw new BadRequestException(ErrorCode.NICKNAME_ALREADY_EXISTS);
            }
            user.updateNickname(request.nickname());
        }
        
        if (request.profileImage() != null) {
            String profileImageKey = fileService.uploadProfileImageIfPresent(request.profileImage());
            user.updateProfileImageKey(profileImageKey);
        }
        
        String imageURL = fileService.convertToPublicImageURL(user.getProfileImageKey());
        return UserInfoResponse.of(user, imageURL, null, null, null);
    }
}
