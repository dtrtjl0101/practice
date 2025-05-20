package qwerty.chaekit.controller.member.user;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import qwerty.chaekit.dto.member.LoginResponse;
import qwerty.chaekit.dto.member.UserInfoResponse;
import qwerty.chaekit.dto.member.UserJoinRequest;
import qwerty.chaekit.global.response.ApiSuccessResponse;
import qwerty.chaekit.global.security.resolver.Login;
import qwerty.chaekit.global.security.resolver.UserToken;
import qwerty.chaekit.service.highlight.HighlightService;
import qwerty.chaekit.service.member.user.UserJoinService;
import qwerty.chaekit.service.member.user.UserService;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Slf4j
public class UserController {
    private final UserJoinService joinService;
    private final UserService userService;
    private final HighlightService highlightService;

    @GetMapping("/me")
    public ApiSuccessResponse<UserInfoResponse> userInfo(@Login UserToken userToken) {
        return ApiSuccessResponse.of(userService.getUserProfile(userToken));
    }

    @PostMapping(path = "/join", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiSuccessResponse<LoginResponse> userJoin(@ModelAttribute @Valid UserJoinRequest joinRequest) {
        return ApiSuccessResponse.of(joinService.join(joinRequest));
    }

    @GetMapping("/me/highlights")
    public ApiSuccessResponse<?> getMyHighlights(
            @Login UserToken userToken,
            @ParameterObject Pageable pageable,
            @RequestParam(required = false) Long bookId
    ) {
        return ApiSuccessResponse.of(highlightService.getMyHighlights(userToken, bookId, pageable));
    }


}
