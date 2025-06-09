package qwerty.chaekit.domain.group.activity.discussion.comment.dto;

public record DiscussionCommentCountDto(
        long totalCount,
        long neutralCount,
        long agreeCount,
        long disagreeCount
) {
    public static DiscussionCommentCountDto ofSingle(long count) {
        return new DiscussionCommentCountDto(count, 0, 0, 0);
    }

    public static DiscussionCommentCountDto ofStanceCounts(long neutral, long agree, long disagree) {
        long total = neutral + agree + disagree;
        return new DiscussionCommentCountDto(total, neutral, agree, disagree);
    }
}
