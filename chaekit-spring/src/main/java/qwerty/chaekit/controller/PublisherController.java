package qwerty.chaekit.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import qwerty.chaekit.dto.PublisherJoinRequest;
import qwerty.chaekit.dto.PublisherJoinResponse;
import qwerty.chaekit.dto.PublisherMemberResponse;
import qwerty.chaekit.global.response.ApiSuccessResponse;
import qwerty.chaekit.global.security.resolver.Login;
import qwerty.chaekit.global.security.resolver.LoginMember;
import qwerty.chaekit.service.PublisherJoinService;
import qwerty.chaekit.service.PublisherService;

@RestController
@RequestMapping("/api/publishers")
@RequiredArgsConstructor
public class PublisherController {
    private final PublisherJoinService joinService;
    private final PublisherService publisherService;

    @GetMapping("/me")
    public ApiSuccessResponse<PublisherMemberResponse> publisherInfo(@Login LoginMember loginMember) {
        return ApiSuccessResponse.of(publisherService.getPublisherProfile(loginMember));
    }

    @PostMapping("/join")
    public ApiSuccessResponse<PublisherJoinResponse> publisherJoin(@RequestBody @Valid PublisherJoinRequest joinRequest) {
        return ApiSuccessResponse.of(joinService.join(joinRequest));
    }
}
