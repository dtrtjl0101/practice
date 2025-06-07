package qwerty.chaekit.dto.group.activity;

import lombok.Builder;

@Builder
public record ActivityScoreResponse(
        Long userId,
        String userProfileImageURL,
        String userNickname,
        long score
) { 
    public static ActivityScoreResponse of(Long userId, String userProfileImageURL, String userNickname, int score) {
        return ActivityScoreResponse.builder()
                .userId(userId)
                .userProfileImageURL(userProfileImageURL)
                .userNickname(userNickname)
                .score(score)
                .build();
    }
}
