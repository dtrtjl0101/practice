package qwerty.chaekit.dto.group.activity.discussion;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record DiscussionPostRequest(
        @NotBlank
        String title,
        @NotBlank
        String content,
        @NotNull
        Boolean isDebate
) { }
