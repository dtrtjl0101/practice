package qwerty.chaekit.dto.group.review;

import lombok.Builder;
import qwerty.chaekit.domain.group.review.GroupReviewTag;

import java.time.LocalDate;
import java.util.List;

@Builder
public record GroupReviewFetchResponse(
        Long reviewId,
        Long groupId,
        String groupName,
        
        Long activityId,
        LocalDate activityStartTime,
        LocalDate activityEndTime,
        
        Long bookId,
        String bookTitle,
        String bookAuthor,
        String bookCoverImageURL,
        
        String content,
        Long authorId,
        String authorNickname,
        String authorProfileImageURL,
        List<GroupReviewTag> tags,
        LocalDate createdAt,
        LocalDate modifiedAt
) {
}
