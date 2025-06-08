package qwerty.chaekit.dto.group.chat;

import jakarta.validation.constraints.NotBlank;

public record GroupChatRequest(
        @NotBlank
        String content
) {}