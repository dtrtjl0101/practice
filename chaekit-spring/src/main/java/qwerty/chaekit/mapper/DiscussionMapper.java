package qwerty.chaekit.mapper;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import qwerty.chaekit.domain.group.activity.discussion.Discussion;
import qwerty.chaekit.domain.group.activity.discussion.DiscussionStance;
import qwerty.chaekit.domain.group.activity.discussion.comment.DiscussionComment;
import qwerty.chaekit.dto.group.activity.discussion.DiscussionCommentFetchResponse;
import qwerty.chaekit.dto.group.activity.discussion.DiscussionDetailResponse;
import qwerty.chaekit.dto.group.activity.discussion.DiscussionFetchResponse;
import qwerty.chaekit.dto.highlight.HighlightSummaryResponse;
import qwerty.chaekit.service.util.FileService;

@Component
@RequiredArgsConstructor
public class DiscussionMapper {
    private final FileService fileService;

    public String convertToPublicImageURL(String imageKey) {
        return fileService.convertToPublicImageURL(imageKey);
    }

    /*
     * @fetch-plan
     * branch: feat/be/discussion
     * date: 2025-05-06
     * required:
     *   - DiscussionComment.author a (ManyToOne, join fetch)
     *   - DiscussionComment.replies r (OneToMany, batch fetch)
     *      - r.author (ManyToOne, batch fetch)
     */
    public DiscussionCommentFetchResponse toCommentFetchResponse(DiscussionComment comment) {
        if(comment.isDeleted()) {
            return DiscussionCommentFetchResponse.builder()
                    .commentId(comment.getId())
                    .content(comment.getContent())
                    .replies(
                            comment.getReplies().stream()
                                    .map(this::toCommentFetchResponse)
                                    .toList()
                    )
                    .isDeleted(true)
                    .build();
        }
        return DiscussionCommentFetchResponse.builder()
                .commentId(comment.getId())
                .authorId(comment.getAuthor().getId())
                .authorName(comment.getAuthor().getNickname())
                .authorProfileImageURL(convertToPublicImageURL(comment.getAuthor().getProfileImageKey()))
                .content(comment.getContent())
                .createdAt(comment.getCreatedAt())
                .modifiedAt(comment.getModifiedAt())
                .isEdited(comment.isEdited())
                .stance(comment.getStance())
                .parentId(comment.getParent() != null ? comment.getParent().getId() : null)
                .replies(
                        comment.getReplies().stream()
                                .map(this::toCommentFetchResponse)
                                .toList()
                )
                .build();
    }

    /*
     * @fetch-plan
     * branch: feat/be/discussion
     * date: 2025-05-06
     * required:
     *  - Discussion.author (ManyToOne, join fetch)
     */
    public DiscussionFetchResponse toFetchResponse(Discussion discussion, Long commentCount, Long memberId, Long agreeCount, Long disagreeCount, Long neutralCount) {
        return DiscussionFetchResponse.builder()
                .discussionId(discussion.getId())
                .activityId(discussion.getActivity().getId())
                .title(discussion.getTitle())
                .content(discussion.getContent())
                .authorId(discussion.getAuthor().getId())
                .authorName(discussion.getAuthor().getNickname())
                .authorProfileImage(convertToPublicImageURL(discussion.getAuthor().getProfileImageKey()))
                .createdAt(discussion.getCreatedAt())
                .modifiedAt(discussion.getModifiedAt())
                .commentCount(commentCount)
                .isDebate(discussion.isDebate())
                .isAuthor(discussion.getAuthor().getId().equals(memberId))
                .highlightIds(discussion.getHighlights().stream()
                        .map(discussionHighlight -> discussionHighlight
                                .getHighlight()
                                .getId())
                        .toList())
                .agreeCount(agreeCount)
                .disagreeCount(disagreeCount)
                .neutralCount(neutralCount)
                .build();
    }

    /*
     * @fetch-plan
     * branch: feat/be/discussion
     * date: 2025-05-06
     * required:
     *  - Discussion.author (ManyToOne, join fetch)
     *  - Discussion.comments c (OneToMany, join fetch)
     *      - c.author (ManyToOne, batch fetch)
     *      - c.replies r (OneToMany, batch fetch)
     *         - r.author (ManyToOne, batch fetch)
     */
    public DiscussionDetailResponse toDetailResponse(Discussion discussion, Long commentCount, Long memberId) {
        return DiscussionDetailResponse.builder()
                .discussionId(discussion.getId())
                .activityId(discussion.getActivity().getId())
                .title(discussion.getTitle())
                .content(discussion.getContent())
                .authorId(discussion.getAuthor().getId())
                .authorName(discussion.getAuthor().getNickname())
                .authorProfileImage(convertToPublicImageURL(discussion.getAuthor().getProfileImageKey()))
                .createdAt(discussion.getCreatedAt())
                .modifiedAt(discussion.getModifiedAt())
                .commentCount(commentCount)
                .isDebate(discussion.isDebate())
                .isAuthor(discussion.getAuthor().getId().equals(memberId))
                .comments(
                        discussion.getComments().stream()
                                .filter(comment -> comment.getParent() == null)
                                .map(this::toCommentFetchResponse)
                                .toList()
                )
                .linkedHighlights(
                        discussion.getHighlights().stream()
                                .map(dh-> HighlightSummaryResponse.of(
                                        dh.getHighlight(),
                                        convertToPublicImageURL(dh.getHighlight().getAuthor().getProfileImageKey())
                                ))
                                .toList()
                )
                .agreeCount(discussion.getComments().stream().filter(comment -> comment.getStance() == DiscussionStance.AGREE).count())
                .disagreeCount(discussion.getComments().stream().filter(comment -> comment.getStance() == DiscussionStance.DISAGREE).count())
                .neutralCount(discussion.getComments().stream().filter(comment -> comment.getStance() == DiscussionStance.NEUTRAL).count())
                .build();
    }
}
