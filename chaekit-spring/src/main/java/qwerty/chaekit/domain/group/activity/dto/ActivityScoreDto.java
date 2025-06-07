package qwerty.chaekit.domain.group.activity.dto;

import qwerty.chaekit.domain.member.user.UserProfile;

public record ActivityScoreDto(
        UserProfile user,
        int score
) { }
