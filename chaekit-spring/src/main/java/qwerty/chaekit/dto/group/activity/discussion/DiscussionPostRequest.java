package qwerty.chaekit.dto.group.activity.discussion;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record DiscussionPostRequest(
        @NotBlank
        String title,
        @NotBlank
        String content,
        @NotNull
        Boolean isDebate,
        List<Long> highlightIds
) { }
