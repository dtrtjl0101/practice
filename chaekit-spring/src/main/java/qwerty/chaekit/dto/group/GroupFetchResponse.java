package qwerty.chaekit.dto.group;

import lombok.Builder;
import qwerty.chaekit.domain.group.grouptag.GroupTag;
import qwerty.chaekit.domain.group.ReadingGroup;
import qwerty.chaekit.dto.group.enums.MyMemberShipStatus;

import java.util.List;

@Builder
public record GroupFetchResponse(
        Long groupId,
        String name,
        String description,
        List<String> tags,
        String groupImageURL,
        MyMemberShipStatus myMemberShipStatus,
        int memberCount
) {
    public static GroupFetchResponse of(ReadingGroup group, String groupImageURL, MyMemberShipStatus myMemberShipStatus) {
        return GroupFetchResponse.builder()
                .groupId(group.getId())
                .name(group.getName())
                .description(group.getDescription())
                .tags(group.getTags().stream()
                        .map(GroupTag::getTagName)
                        .toList())
                .groupImageURL(groupImageURL)
                .myMemberShipStatus(myMemberShipStatus)
                .memberCount(group.getMembers().size())
                .build();
    }
}
