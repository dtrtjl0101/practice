package qwerty.chaekit.service.highlight;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import qwerty.chaekit.domain.ebook.repository.EbookRepository;
import qwerty.chaekit.domain.group.activity.repository.ActivityRepository;
import qwerty.chaekit.domain.highlight.entity.Highlight;
import qwerty.chaekit.domain.highlight.entity.reaction.HighlightReaction;
import qwerty.chaekit.domain.highlight.repository.HighlightRepository;
import qwerty.chaekit.domain.highlight.repository.reaction.HighlightReactionRepository;
import qwerty.chaekit.domain.member.user.UserProfileRepository;
import qwerty.chaekit.dto.highlight.HighlightFetchResponse;
import qwerty.chaekit.dto.highlight.HighlightPostRequest;
import qwerty.chaekit.dto.highlight.HighlightPostResponse;
import qwerty.chaekit.dto.highlight.HighlightPutRequest;
import qwerty.chaekit.dto.highlight.reaction.ReactionResponse;
import qwerty.chaekit.dto.page.PageResponse;
import qwerty.chaekit.global.enums.ErrorCode;
import qwerty.chaekit.global.exception.ForbiddenException;
import qwerty.chaekit.global.exception.NotFoundException;
import qwerty.chaekit.global.security.resolver.UserToken;
import qwerty.chaekit.service.util.S3Service;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class HighlightService {
    private final HighlightRepository highlightRepository;
    private final EbookRepository ebookRepository;
    private final UserProfileRepository userRepository;
    private final ActivityRepository activityRepository;
    private final HighlightReactionRepository reactionRepository;
    private final S3Service s3Service;

    public HighlightPostResponse createHighlight(UserToken userToken, HighlightPostRequest request) {
        Long userId = userToken.userId();
        if(!userRepository.existsById(userId)) {
            throw new NotFoundException(ErrorCode.USER_NOT_FOUND);
        }
        if(!ebookRepository.existsById(request.bookId())) {
            throw new NotFoundException(ErrorCode.EBOOK_NOT_FOUND);
        }
        Highlight highlight = Highlight.builder()
                .book(ebookRepository.getReferenceById(request.bookId()))
                .spine(request.spine())
                .cfi(request.cfi())
                .author(userRepository.getReferenceById(userId))
                .memo(request.memo())
                .activity(request.activityId() != null ? activityRepository.getReferenceById(request.activityId()) : null)
                .build();
        Highlight savedHighlight = highlightRepository.save(highlight);
        return HighlightPostResponse.of(savedHighlight);
    }

    public PageResponse<HighlightFetchResponse> fetchHighlights(UserToken userToken, Pageable pageable, Long activityId, Long bookId, String spine, Boolean me) {
        /*
        TODO: activityMemberRepository 구현 시 검증.
        if(!activityMemberRepository.existsByActivityIdAndUserId(activityId, userToken.userId())){
            throw new ForbiddenException(ErrorCode.ACTIVITY_MEMBER_ONLY);
        }
        */
        Page<Highlight> highlights = highlightRepository.findHighlights(pageable, userToken.userId(), activityId, bookId, spine, me);
        return PageResponse.of(highlights.map(
                highlight -> HighlightFetchResponse.of(
                        highlight,
                        s3Service.convertToPublicImageURL(highlight.getAuthor().getProfileImageKey())
                )
        ));
    }

    @Transactional
    public HighlightPostResponse updateHighlight(UserToken userToken, Long id, HighlightPutRequest request) {
        Highlight highlight = highlightRepository.findById(id)
                .orElseThrow(() -> new NotFoundException(ErrorCode.HIGHLIGHT_NOT_FOUND));

        if(!userToken.userId().equals(highlight.getAuthor().getId())) {
            throw new ForbiddenException(ErrorCode.HIGHLIGHT_NOT_YOURS);
        }

        if (highlight.isPublic()) {
            throw new ForbiddenException(ErrorCode.HIGHLIGHT_ALREADY_PUBLIC);
        }

        if (request.activityId() != null) {
            highlight.setActivity(activityRepository.getReferenceById(request.activityId()));
            highlight.makePublic();
        }

        highlight.updateMemo(request.memo());
        return HighlightPostResponse.of(highlightRepository.save(highlight));
    }

    public void deleteHighlight(UserToken userToken, Long id) {
        Highlight highlight = highlightRepository.findById(id)
                .orElseThrow(() -> new NotFoundException(ErrorCode.HIGHLIGHT_NOT_FOUND));
        
        if(!userToken.userId().equals(highlight.getAuthor().getId())) {
            throw new ForbiddenException(ErrorCode.HIGHLIGHT_NOT_YOURS);
        }

        if (highlight.isPublic()) {
            throw new ForbiddenException(ErrorCode.HIGHLIGHT_ALREADY_PUBLIC);
        }

        highlightRepository.delete(highlight);
    }

    public List<ReactionResponse> getHighlightReactions(Long highlightId) {
        Highlight highlight = highlightRepository.findById(highlightId)
                .orElseThrow(() -> new NotFoundException(ErrorCode.HIGHLIGHT_NOT_FOUND));

        List<HighlightReaction> reactions = reactionRepository.findByHighlightIdAndCommentIdIsNull(highlightId);
        
        return reactions.stream()
                .map(ReactionResponse::of)
                .collect(Collectors.toList());
    }
}
