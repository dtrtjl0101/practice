package qwerty.chaekit.dto.group;

import lombok.Builder;
import qwerty.chaekit.domain.group.tag.GroupTag;
import qwerty.chaekit.domain.group.ReadingGroup;

import java.util.List;

@Builder
public record GroupFetchResponse(
        Long groupId,
        String name,
        String description,
        List<String> tags,
        String groupImageURL,
        MemberShipStatus memberShipStatus,
        int memberCount
) {
    public static GroupFetchResponse of(ReadingGroup group, String groupImageURL, MemberShipStatus memberShipStatus) {
        return GroupFetchResponse.builder()
                .groupId(group.getId())
                .name(group.getName())
                .description(group.getDescription())
                .tags(group.getTags().stream()
                        .map(GroupTag::getTagName)
                        .toList())
                .groupImageURL(groupImageURL)
                .memberShipStatus(memberShipStatus)
                .memberCount(group.getMembers().size())
                .build();
    }
}
