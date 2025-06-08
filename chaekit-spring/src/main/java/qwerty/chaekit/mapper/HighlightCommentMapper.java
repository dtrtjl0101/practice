package qwerty.chaekit.mapper;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import qwerty.chaekit.domain.highlight.comment.HighlightComment;
import qwerty.chaekit.domain.highlight.reaction.HighlightReaction;
import qwerty.chaekit.dto.highlight.comment.HighlightCommentResponse;
import qwerty.chaekit.dto.highlight.reaction.HighlightReactionResponse;
import qwerty.chaekit.service.util.FileService;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class HighlightCommentMapper {
    private final FileService fileService;

    public String convertToPublicImageURL(String imageKey) {
        return fileService.convertToPublicImageURL(imageKey);
    }
    
    public HighlightCommentResponse toResponse(HighlightComment comment) {
        return toResponse(comment, Collections.emptyMap());
    }

    public HighlightCommentResponse toResponse(HighlightComment comment, Map<Long, List<HighlightReaction>> reactionsByCommentId) {
        List<HighlightCommentResponse> replies = comment.getReplies().stream()
                .map(reply -> toResponse(
                        reply, reactionsByCommentId))
                .collect(Collectors.toList());

        List<HighlightReactionResponse> reactions = reactionsByCommentId.getOrDefault(comment.getId(), Collections.emptyList())
                .stream()
                .map(HighlightReactionResponse::of)
                .collect(Collectors.toList());

        return new HighlightCommentResponse(
                comment.getId(),
                comment.getAuthor().getId(),
                comment.getAuthor().getNickname(),
                convertToPublicImageURL(comment.getAuthor().getProfileImageKey()),
                comment.getContent(),
                comment.getCreatedAt(),
                comment.getModifiedAt(),
                replies,
                reactions
        );
    }
}
