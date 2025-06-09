package qwerty.chaekit.dto.group.chat;

import lombok.Builder;
import qwerty.chaekit.domain.group.chat.GroupChat;

import java.time.LocalDateTime;

@Builder
public record GroupChatResponse(
        Long chatId,
        Long groupId,
        Long authorId,
        String authorName,
        String authorProfileImage,
        String content,
        LocalDateTime createdAt
) {
    public static GroupChatResponse of(GroupChat chat, String authorProfileImageURL) {
        return GroupChatResponse.builder()
                .chatId(chat.getId())
                .groupId(chat.getGroup().getId())
                .authorId(chat.getAuthor().getId())
                .authorName(chat.getAuthor().getNickname())
                .authorProfileImage(authorProfileImageURL)
                .content(chat.getContent())
                .createdAt(chat.getCreatedAt())
                .build();
    }
}