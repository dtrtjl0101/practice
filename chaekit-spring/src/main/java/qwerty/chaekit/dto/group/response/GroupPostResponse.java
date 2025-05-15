package qwerty.chaekit.dto.group.response;

import lombok.Builder;
import qwerty.chaekit.domain.group.ReadingGroup;
import qwerty.chaekit.domain.group.grouptag.GroupTag;

import java.util.List;

@Builder
public record GroupPostResponse(
        Long groupId,
        String name,
        String description,
        String groupImageURL,
        List<String> tags
) {
    public static GroupPostResponse of(ReadingGroup group, String groupImageURL) {
        return GroupPostResponse.builder()
                .groupId(group.getId())
                .name(group.getName())
                .description(group.getDescription())
                .groupImageURL(groupImageURL)
                .tags(group.getTags().stream()
                        .map(GroupTag::getTagName)
                        .toList())
                .build();
    }
}
