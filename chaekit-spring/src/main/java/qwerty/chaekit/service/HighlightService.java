package qwerty.chaekit.service;

import com.querydsl.core.BooleanBuilder;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import qwerty.chaekit.domain.ebook.Ebook;
import qwerty.chaekit.domain.ebook.EbookRepository;
import qwerty.chaekit.domain.highlight.Highlight;
import qwerty.chaekit.domain.highlight.HighlightRepository;
import qwerty.chaekit.domain.highlight.QHighlight;
import qwerty.chaekit.domain.member.user.UserProfile;
import qwerty.chaekit.domain.member.user.UserProfileRepository;
import qwerty.chaekit.dto.highlight.*;
import qwerty.chaekit.dto.page.PageResponse;
import qwerty.chaekit.global.enums.ErrorCode;
import qwerty.chaekit.global.exception.BadRequestException;
import qwerty.chaekit.global.exception.ForbiddenException;
import qwerty.chaekit.global.exception.NotFoundException;
import qwerty.chaekit.global.security.resolver.LoginMember;
import com.querydsl.jpa.impl.JPAQueryFactory;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

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
                .orElseThrow(() -> new NotFoundException(ErrorCode.USER_NOT_FOUND));
        Ebook ebook = ebookRepository.findById(request.bookId())
                .orElseThrow(() -> new NotFoundException(ErrorCode.EBOOK_NOT_FOUND));

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

    public PageResponse<HighlightFetchResponse> fetchHighlights(LoginMember loginMember, Pageable pageable, Long activityId, Long bookId, String spine, Boolean me) {
        // 추후 repository layer로 이동
        QHighlight highlight = QHighlight.highlight;

        // 동적 쿼리 조건 생성
        BooleanBuilder where = new BooleanBuilder();

        if (activityId != null) {
            throw new IllegalStateException("Not Implemented Yet");
        }
        if (bookId != null) {
            where.and(highlight.book.id.eq(bookId));
        }
        if (spine != null) {
            if(bookId == null) {
                throw new BadRequestException(ErrorCode.BOOK_ID_REQUIRED);
            }
            where.and(highlight.spine.eq(spine));
        }
        if (me == null || me) {
            where.and(highlight.author.member.id.eq(loginMember.memberId()));
        } else {
            // TODO: activityId에 현재 자신이 속해 있는 경우만 가능
            throw new IllegalStateException("Not Implemented Yet");
        }

        List<HighlightFetchResponse> highlights = jpaQueryFactory
                .selectFrom(highlight)
                .where(where)
                .offset(pageable.getOffset())
                .limit(pageable.getPageSize())
                .fetch()
                .stream()
                .map(HighlightFetchResponse::of)
                .toList();

        long totalElement = Optional.ofNullable(
                jpaQueryFactory
                        .select(highlight.count())
                        .from(highlight)
                        .where(where)
                        .fetchOne()
        ).orElse(0L);

        return PageResponse.of(new PageImpl<>(highlights, pageable, totalElement));
    }

    public HighlightPostResponse updateHighlight(LoginMember loginMember, Long id, HighlightPutRequest request) {
        Highlight highlight = highlightRepository.findById(id)
                .orElseThrow(() -> new NotFoundException(ErrorCode.HIGHLIGHT_NOT_FOUND));
        if(!Objects.equals(loginMember.memberId(), highlight.getAuthor().getMember().getId())) {
            throw new ForbiddenException(ErrorCode.HIGHLIGHT_NOT_YOURS);
        }
        highlight.updateMemo(request.memo());

        // TODO: activityId 업데이트 로직 추가(활동에 공개하기)
        // 기존 activityId가 null일때만 activityId 변경 가능.
        //

        return HighlightPostResponse.of(highlightRepository.save(highlight));
    }

}
