package qwerty.chaekit.dto.group.response;

import lombok.Builder;
import qwerty.chaekit.dto.group.enums.MyMemberShipStatus;

import java.util.List;

@Builder
public record GroupFetchResponse(
        Long groupId,
        String name,
        String description,
        List<String> tags,
        String groupImageURL,
        Long leaderId,
        String leaderNickname,
        String leaderProfileImageURL,
        MyMemberShipStatus myMemberShipStatus,
        boolean isAutoApproval,
        int memberCount
) { }
