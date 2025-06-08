package qwerty.chaekit.service.highlight;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import qwerty.chaekit.domain.ebook.Ebook;
import qwerty.chaekit.domain.group.activity.Activity;
import qwerty.chaekit.domain.group.activity.discussion.Discussion;
import qwerty.chaekit.domain.group.activity.discussion.highlight.DiscussionHighlight;
import qwerty.chaekit.domain.group.activity.discussion.highlight.DiscussionHighlightRepository;
import qwerty.chaekit.domain.highlight.Highlight;
import qwerty.chaekit.domain.highlight.repository.HighlightRepository;
import qwerty.chaekit.domain.member.user.UserProfile;
import qwerty.chaekit.dto.highlight.*;
import qwerty.chaekit.dto.page.PageResponse;
import qwerty.chaekit.global.enums.ErrorCode;
import qwerty.chaekit.global.exception.BadRequestException;
import qwerty.chaekit.global.exception.ForbiddenException;
import qwerty.chaekit.global.security.resolver.UserToken;
import qwerty.chaekit.service.ebook.EbookPolicy;
import qwerty.chaekit.service.group.ActivityPolicy;
import qwerty.chaekit.service.util.EntityFinder;
import qwerty.chaekit.service.util.FileService;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class HighlightService {
    private final HighlightRepository highlightRepository;
    private final DiscussionHighlightRepository discussionHighlightRepository;
    private final ActivityPolicy activityPolicy;
    private final HighlightPolicy highlightPolicy;
    private final EntityFinder entityFinder;
    private final FileService fileService;
    private final EbookPolicy ebookPolicy;

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
            ebookPolicy.assertEBookPurchased(user, ebook);
        }
        
        Highlight highlight = Highlight.builder()
                .author(user)
                .book(ebook)
                .spine(spine)
                .cfi(cfi)
                .memo(memo)
                .isPublic(isPublic)
                .activity(activity)
                .highlightcontent(request.highlightContent())
                .build();
        
        return HighlightPostResponse.of(highlightRepository.save(highlight));
    }

    public PageResponse<HighlightFetchResponse> getMyHighlights(UserToken userToken, @Nullable Long bookId, Pageable pageable) {
        UserProfile user = entityFinder.findUser(userToken.userId());
        Page<Highlight> highlights = highlightRepository.findByAuthor(user, bookId, pageable);

        Map<Long, List<Discussion>> relatedDiscussionMap = getRelatedDiscussionMap(highlights);

        return PageResponse.of(highlights.map(
                highlight -> HighlightFetchResponse.of(
                        highlight,
                        fileService.convertToPublicImageURL(highlight.getAuthor().getProfileImageKey()),
                        fileService.convertToPublicImageURL(highlight.getBook().getCoverImageKey()),
                        highlight.getActivity() != null ?
                            fileService.convertToPublicImageURL(highlight.getActivity().getGroup().getGroupImageKey()) : null,
                        relatedDiscussionMap.getOrDefault(highlight.getId(), List.of())
                )
        ));
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

        // 조회 조건에 맞는 하이라이트를 가져옴

        Page<Highlight> highlights = highlightRepository.findHighlights(pageable, userToken.userId(), activityId, bookId, spine, me);

        Map<Long, List<Discussion>> relatedDiscussionMap = getRelatedDiscussionMap(highlights);

        return PageResponse.of(highlights.map(
                highlight -> HighlightFetchResponse.of(
                        highlight,
                        fileService.convertToPublicImageURL(highlight.getAuthor().getProfileImageKey()),
                        fileService.convertToPublicImageURL(highlight.getBook().getCoverImageKey()),
                        highlight.getActivity() != null ?
                                fileService.convertToPublicImageURL(highlight.getActivity().getGroup().getGroupImageKey()) : null,
                        relatedDiscussionMap.getOrDefault(highlight.getId(), List.of())
                )
        ));
    }

    private Map<Long, List<Discussion>> getRelatedDiscussionMap(Page<Highlight> highlights) {
        // 1. highlightId 추출
        List<Long> highlightIds = highlights.stream()
                .map(Highlight::getId)
                .toList();

        // 2. 연관된 DiscussionHighlight를 모두 조회
        List<DiscussionHighlight> discussionLinks = discussionHighlightRepository.findByHighlightIdIn(highlightIds);

        // 3. highlightId → List<Discussion> 매핑
        return discussionLinks.stream()
                .collect(Collectors.groupingBy(
                        dh -> dh.getHighlight().getId(),
                        Collectors.mapping(DiscussionHighlight::getDiscussion, Collectors.toList())
                ));
    }

    @Transactional(readOnly = true)
    public List<HighlightPreviewResponse> getActivityRecentHighlights(Long activityId) {
        Activity activity = entityFinder.findActivity(activityId);
        List<Highlight> highlights = highlightRepository.findRecentByActivity(activity);

        return highlights.stream()
                .map(highlight -> HighlightPreviewResponse.of(
                        highlight,
                        fileService.convertToPublicImageURL(highlight.getAuthor().getProfileImageKey())
                ))
                .toList();
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

    public HighlightFetchResponse fetchHighlight(UserToken userToken, Long id) {
        UserProfile user = entityFinder.findUser(userToken.userId());
        Highlight highlight = entityFinder.findHighlight(id);

        if (!highlight.isAuthor(user) && !highlight.isPublic()) {
            throw new ForbiddenException(ErrorCode.HIGHLIGHT_NOT_SEE);
        }
        List<Discussion> discussionLinks = discussionHighlightRepository.findByHighlight(highlight)
                .stream()
                .map(DiscussionHighlight::getDiscussion).toList();
        String authorProfileImageURL = fileService.convertToPublicImageURL(highlight.getAuthor().getProfileImageKey());
        String bookCoverImageURL = fileService.convertToPublicImageURL(highlight.getBook().getCoverImageKey());
        String groupImageURL = highlight.getActivity() != null ?
                fileService.convertToPublicImageURL(highlight.getActivity().getGroup().getGroupImageKey()) : null;
        return HighlightFetchResponse.of(highlight, authorProfileImageURL, bookCoverImageURL, groupImageURL, discussionLinks);
    }
}
