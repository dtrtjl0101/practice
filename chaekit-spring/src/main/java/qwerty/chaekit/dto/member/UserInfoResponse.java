package qwerty.chaekit.dto.member;

import lombok.Builder;
import qwerty.chaekit.domain.group.activity.Activity;
import qwerty.chaekit.domain.member.user.UserProfile;

import java.time.LocalDateTime;

@Builder
public record UserInfoResponse(
        Long memberId,
        String email,
        Long userId,
        String nickname,
        String profileImageURL,
        String role,
        Long recentGroupId,
        String recentGroupName,
        String recentGroupImageURL,
        Long recentActivityId,
        String recentActivityBookTitle,
        String recentActivityBookAuthor,
        String recentActivityBookCoverImageURL,
        LocalDateTime createdAt
        
){
    public static UserInfoResponse of(UserProfile user, String profileImageURL, Activity recentActivity, String groupImageURL, String bookImageURL) {
        return UserInfoResponse.builder()
                .memberId(user.getMember().getId())
                .email(user.getMember().getEmail())
                .userId(user.getId())
                .nickname(user.getNickname())
                .profileImageURL(profileImageURL)
                .role(user.getMember().getRole().name())
                
                .recentGroupId(recentActivity == null ? null : recentActivity.getGroup().getId())
                .recentGroupName(recentActivity == null ? null : recentActivity.getGroup().getName())
                .recentGroupImageURL(recentActivity == null ? null : groupImageURL)
                
                .recentActivityId(recentActivity == null ? null : recentActivity.getId())
                .recentActivityBookTitle(recentActivity == null ? null : recentActivity.getBook().getTitle())
                .recentActivityBookAuthor(recentActivity == null ? null : recentActivity.getBook().getAuthor())
                .recentActivityBookCoverImageURL(bookImageURL)
                
                .createdAt(user.getCreatedAt())
                .build();
    }
}
