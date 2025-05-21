package qwerty.chaekit.dto.group.activity.discussion;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.hibernate.validator.constraints.Length;

import java.util.List;

public record DiscussionPostRequest(
        @NotBlank
        @Length(max = 100)
        String title,
        @NotBlank
        @Length(max = 5000)
        String content,
        @NotNull
        Boolean isDebate,
        List<Long> highlightIds
) { }
