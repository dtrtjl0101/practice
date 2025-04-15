package qwerty.chaekit.dto.group;

import lombok.Builder;
import qwerty.chaekit.domain.group.ReadingGroup;
import qwerty.chaekit.domain.group.tag.GroupTag;

import java.util.List;

@Builder
public record GroupPostResponse(
        Long groupId,
        String name,
        String description,
        List<String> tags
) {
    public static GroupPostResponse of(ReadingGroup group) {
        return GroupPostResponse.builder()
                .groupId(group.getId())
                .name(group.getName())
                .description(group.getDescription())
                .tags(group.getTags().stream()
                        .map(GroupTag::getTagName)
                        .toList())
                .build();
    }
}
