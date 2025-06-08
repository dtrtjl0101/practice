package qwerty.chaekit.mapper;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import qwerty.chaekit.domain.group.review.GroupReview;
import qwerty.chaekit.domain.group.review.GroupReviewTagRelation;
import qwerty.chaekit.dto.group.review.GroupReviewFetchResponse;
import qwerty.chaekit.service.util.FileService;

@Component
@RequiredArgsConstructor
public class GroupReviewMapper {
    private final FileService fileService;
    
    public String convertToPublicImageURL(String imageKey) {
        return fileService.convertToPublicImageURL(imageKey);
    }
    
    public GroupReviewFetchResponse toFetchResponse(GroupReview review) {
        return GroupReviewFetchResponse.builder()
                .reviewId(review.getId())
                .groupId(review.getGroup().getId())
                .groupName(review.getGroup().getName())
                
                .activityId(review.getActivity().getId())
                .activityStartTime(review.getActivity().getEndTime())
                .activityEndTime(review.getActivity().getEndTime())
                
                .bookId(review.getActivity().getId())
                .bookTitle(review.getActivity().getBook().getTitle())
                .bookAuthor(review.getActivity().getBook().getAuthor())
                .bookCoverImageURL(convertToPublicImageURL(review.getActivity().getBook().getCoverImageKey()))
                
                .authorId(review.getAuthor().getId())
                .authorNickname(review.getAuthor().getNickname())
                .authorProfileImageURL(convertToPublicImageURL(review.getAuthor().getProfileImageKey()))
                .content(review.getContent())
                .tags(review.getTags()
                        .stream()
                        .map(GroupReviewTagRelation::getTag)
                        .toList())
                .createdAt(review.getCreatedAt().toLocalDate())
                .build();
    }
}
