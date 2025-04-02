package qwerty.chaekit.service;

import com.querydsl.jpa.impl.JPAQuery;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import qwerty.chaekit.domain.ebook.Ebook;
import qwerty.chaekit.domain.ebook.EbookRepository;
import qwerty.chaekit.domain.highlight.Highlight;
import qwerty.chaekit.domain.highlight.HighlightRepository;
import qwerty.chaekit.domain.highlight.QHighlight;
import qwerty.chaekit.domain.member.user.UserProfile;
import qwerty.chaekit.domain.member.user.UserProfileRepository;
import qwerty.chaekit.dto.highlight.HighlightFetchResponse;
import qwerty.chaekit.dto.highlight.HighlightListResponse;
import qwerty.chaekit.dto.highlight.HighlightPostRequest;
import qwerty.chaekit.dto.highlight.HighlightPostResponse;
import qwerty.chaekit.global.exception.NotFoundException;
import qwerty.chaekit.global.security.resolver.LoginMember;
import com.querydsl.jpa.impl.JPAQueryFactory;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class HighlightService {
    private final JPAQueryFactory jpaQueryFactory;
    private final HighlightRepository highlightRepository;
    private final EbookRepository ebookRepository;
    private final UserProfileRepository userProfileRepository;

    public HighlightPostResponse createHighlight(LoginMember loginMember, HighlightPostRequest request) {
        UserProfile userProfile = userProfileRepository.findByMember_Id(loginMember.memberId())
                .orElseThrow(() -> new NotFoundException("USER_NOT_FOUND", "일반 회원이 아니거나 존재하지 않습니다."));
        Ebook ebook = ebookRepository.findById(request.bookId())
                .orElseThrow(() -> new NotFoundException("BOOK_NOT_FOUND", "해당 전자책이 없습니다."));

        // Activity를 추가하는 경우 권한 체크 필요

        Highlight highlight = Highlight.builder()
                .book(ebook)
                .spine(request.spine())
                .cfi(request.cfi())
                .author(userProfile)
                .memo(request.memo())
                .build();
        Highlight savedHighlight = highlightRepository.save(highlight);
        return HighlightPostResponse.of(savedHighlight);
    }

    // 내 하이라이트 목록들
    // 1. 내 모든 하이라이트
    // 2. 특정 책의 내 하이라이트 목록
    // 3. 특정 활동에서 공개된 내 하이라이트 목록
    // 4. 특정 활동에서 공개된 모든 하이라이트 조회

    public HighlightListResponse fetchHighlights(LoginMember loginMember, Pageable pageable, Long activityId, Long bookId, String spine, Boolean me) {
        // 추후 repository layer로 이동
        QHighlight highlight = QHighlight.highlight;

        JPAQuery<Highlight> jpaQuery = jpaQueryFactory.selectFrom(highlight);

        if (activityId != null) {
            throw new IllegalStateException("Not Implemented Yet");
        }
        if (bookId != null) {
            jpaQuery.where(highlight.book.id.eq(bookId));
        }
        if (spine != null) {
            jpaQuery.where(highlight.spine.eq(spine));
        }
        if (me == null || me) {
            jpaQuery.where(highlight.author.member.id.eq(loginMember.memberId()));
        } else {
            // activityId에 현재 자신이 속해 있는 경우만 가능
            throw new IllegalStateException("Not Implemented Yet");
        }

        List<Highlight> highlights = jpaQuery
                .offset(pageable.getOffset())
                .limit(pageable.getPageSize())
                .fetch();

        long total = highlights.size();

        return HighlightListResponse.builder()
                .highlights(
                        highlights.stream()
                        .map(HighlightFetchResponse::of)
                        .toList())
                .currentPage(pageable.getPageNumber())
                .totalItems(total)
                .totalPages((int) Math.ceil((double) total / pageable.getPageSize()))
                .build();
    }

}
