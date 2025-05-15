package qwerty.chaekit.service.highlight;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import qwerty.chaekit.domain.ebook.Ebook;
import qwerty.chaekit.domain.group.activity.Activity;
import qwerty.chaekit.domain.highlight.entity.Highlight;
import qwerty.chaekit.domain.highlight.entity.reaction.HighlightReaction;
import qwerty.chaekit.domain.highlight.repository.HighlightRepository;
import qwerty.chaekit.domain.highlight.repository.reaction.HighlightReactionRepository;
import qwerty.chaekit.domain.member.user.UserProfile;
import qwerty.chaekit.dto.highlight.HighlightFetchResponse;
import qwerty.chaekit.dto.highlight.HighlightPostRequest;
import qwerty.chaekit.dto.highlight.HighlightPostResponse;
import qwerty.chaekit.dto.highlight.HighlightPutRequest;
import qwerty.chaekit.dto.highlight.reaction.ReactionResponse;
import qwerty.chaekit.dto.page.PageResponse;
import qwerty.chaekit.global.enums.ErrorCode;
import qwerty.chaekit.global.exception.BadRequestException;
import qwerty.chaekit.global.security.resolver.UserToken;
import qwerty.chaekit.service.group.ActivityPolicy;
import qwerty.chaekit.service.util.EntityFinder;
import qwerty.chaekit.service.util.S3Service;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class HighlightService {
    private final HighlightRepository highlightRepository;
    private final HighlightReactionRepository reactionRepository;
    private final ActivityPolicy activityPolicy;
    private final HighlightPolicy highlightPolicy;
    private final S3Service s3Service;
    private final EntityFinder entityFinder;

    public HighlightPostResponse createHighlight(UserToken userToken, HighlightPostRequest request) {
        UserProfile user = entityFinder.findUser(userToken.userId());
        Ebook ebook = entityFinder.findEbook(request.bookId());
        String spine = request.spine();
        String cfi = request.cfi();
        String memo = request.memo();
        Long activityId = request.activityId();
        boolean isPublic = activityId!= null;
        
        Activity activity;
        if (isPublic) {
            activity = entityFinder.findActivity(request.activityId());
            activityPolicy.assertJoined(user, activity);
        } else {
            activity = null;
        }
        
        Highlight highlight = Highlight.builder()
                .author(user)
                .book(ebook)
                .spine(spine)
                .cfi(cfi)
                .memo(memo)
                .isPublic(isPublic)
                .activity(activity)
                .build();
        
        return HighlightPostResponse.of(highlightRepository.save(highlight));
    }

    public PageResponse<HighlightFetchResponse> fetchHighlights(UserToken userToken, Pageable pageable, Long activityId, Long bookId, String spine, boolean me) {
        boolean isFetchingByActivity = activityId != null;
        boolean isFetchingBySpineButBookIdIsNull = spine != null && bookId == null;
        boolean isFetchingPublicHighlight = !me;
        
        if (isFetchingBySpineButBookIdIsNull) {
            throw new BadRequestException(ErrorCode.BOOK_ID_REQUIRED);
        }
        
        if (isFetchingByActivity) {
            activityPolicy.assertJoined(userToken.userId(), activityId);
        } else if (isFetchingPublicHighlight) {
            throw new BadRequestException(ErrorCode.ACTIVITY_ID_REQUIRED);
        }
        
        Page<Highlight> highlights = highlightRepository.findHighlights(pageable, userToken.userId(), activityId, bookId, spine, me);
        return PageResponse.of(highlights.map(
                highlight -> HighlightFetchResponse.of(
                        highlight,
                        getPublicImageURL(highlight)
                )
        ));
    }

    @Transactional
    public HighlightPostResponse updateHighlight(UserToken userToken, Long id, HighlightPutRequest request) {
        Long newActivityId = request.activityId();
        String newMemo = request.memo();
        
        UserProfile user = entityFinder.findUser(userToken.userId());
        Highlight highlight = entityFinder.findHighlight(id);

        highlightPolicy.assertUpdatable(user, highlight);
        
        if(newActivityId != null) {
            Activity activity = entityFinder.findActivity(newActivityId);
            activityPolicy.assertJoined(user, activity);
            highlight.setAsPublicActivity(activity);
        }

        highlight.updateMemo(newMemo);
        return HighlightPostResponse.of(highlightRepository.save(highlight));
    }

    public void deleteHighlight(UserToken userToken, Long id) {
        UserProfile user = entityFinder.findUser(userToken.userId());
        Highlight highlight = entityFinder.findHighlight(id);

        highlightPolicy.assertUpdatable(user, highlight);

        highlightRepository.delete(highlight);
    }

    // TODO: move this method to HighlightReactionService 
    public List<ReactionResponse> getHighlightReactions(UserToken userToken, Long highlightId) {
        Highlight highlight = entityFinder.findHighlight(highlightId);
        if(highlight.isPublic()) {
            activityPolicy.assertJoined(userToken.userId(), highlightId);
        } else {
            highlightPolicy.assertUpdatable(userToken.userId(), highlight);
        }

        List<HighlightReaction> reactions = reactionRepository.findByHighlightIdAndCommentIdIsNull(highlightId);
        
        return reactions.stream()
                .map(ReactionResponse::of)
                .collect(Collectors.toList());
    }
    
    // helper methods
    
    private String getPublicImageURL(Highlight highlight) {
        return s3Service.convertToPublicImageURL(highlight.getAuthor().getProfileImageKey());
    }
}
