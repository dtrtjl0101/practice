package qwerty.chaekit.controller.member.publisher;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import qwerty.chaekit.dto.ebook.EbookFetchResponse;
import qwerty.chaekit.dto.member.LoginResponse;
import qwerty.chaekit.dto.member.PublisherInfoResponse;
import qwerty.chaekit.dto.member.PublisherJoinRequest;
import qwerty.chaekit.dto.member.PublisherStatsResponse;
import qwerty.chaekit.dto.page.PageResponse;
import qwerty.chaekit.global.response.ApiSuccessResponse;
import qwerty.chaekit.global.security.resolver.Login;
import qwerty.chaekit.global.security.resolver.PublisherToken;
import qwerty.chaekit.service.ebook.EbookService;
import qwerty.chaekit.service.member.publisher.PublisherJoinService;
import qwerty.chaekit.service.member.publisher.PublisherService;

@RestController
@RequestMapping("/api/publishers")
@RequiredArgsConstructor
@Slf4j
public class PublisherController {
    private final PublisherJoinService joinService;
    private final PublisherService publisherService;
    private final EbookService ebookService;

    @Operation(
            summary = "출판사 정보 조회",
            description = "로그인한 출판사의 프로필 정보를 조회합니다."
    )
    @GetMapping("/me")
    public ApiSuccessResponse<PublisherInfoResponse> publisherInfo(@Login PublisherToken token) {
        return ApiSuccessResponse.of(publisherService.getPublisherProfile(token));
    }

    @Operation(
            summary = "출판사 회원가입",
            description = "출판사 회원가입을 위한 API입니다. " +
                    "필요한 정보는 프로필 사진, 이름, 이메일, 비밀번호, 이메일 인증코드입니다."
    )
    @PostMapping(path = "/join", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiSuccessResponse<LoginResponse> publisherJoin(@ModelAttribute @Valid PublisherJoinRequest joinRequest) {
        return ApiSuccessResponse.of(joinService.join(joinRequest));
    }
    
    @Operation(
            summary = "출판사 도서 조회",
            description = "로그인한 출판사가 등록한 도서 목록을 조회합니다. "
    )
    @GetMapping("/me/books")
    public ApiSuccessResponse<PageResponse<EbookFetchResponse>> getPublisherBooks(
            @Parameter(hidden = true) @Login PublisherToken token,
            @ParameterObject Pageable pageable
    ) {
        return ApiSuccessResponse.of(ebookService.fetchBooksByPublisher(token, pageable));
    }
    
    @Operation(
            summary = "출판사 통계 조회",
            description = "로그인한 출판사의 통계 정보를 조회합니다."
    )
    @GetMapping("/stats")
    public ApiSuccessResponse<PublisherStatsResponse> getPublisherStats(
            @Parameter(hidden = true) @Login PublisherToken token
    ) {
        return ApiSuccessResponse.of(publisherService.getPublisherStats(token));
    }
}
