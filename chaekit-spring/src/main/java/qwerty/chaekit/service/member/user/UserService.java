package qwerty.chaekit.service.member.user;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
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

    public UserInfoResponse getUserProfile(UserToken userToken) {
        UserProfile user = userRepository.findById(userToken.userId())
                .orElseThrow(() -> new NotFoundException(ErrorCode.USER_NOT_FOUND));
        String imageURL = fileService.convertToPublicImageURL(user.getProfileImageKey());

        return UserInfoResponse.of(user, imageURL);
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
        return UserInfoResponse.of(user, imageURL);
    }
}
