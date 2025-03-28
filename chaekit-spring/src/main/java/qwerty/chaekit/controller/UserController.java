package qwerty.chaekit.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import qwerty.chaekit.dto.UserJoinRequest;
import qwerty.chaekit.dto.UserMyInfoResponse;
import qwerty.chaekit.global.security.resolver.Login;
import qwerty.chaekit.global.security.resolver.LoginMember;
import qwerty.chaekit.service.UserJoinService;
import qwerty.chaekit.service.UserService;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserJoinService joinService;
    private final UserService userService;

    @GetMapping("/me")
    public UserMyInfoResponse userInfo(@Login LoginMember loginMember) {
        return userService.getUserProfile(loginMember);
    }

    @PostMapping("/join")
    public UserMyInfoResponse userJoin(@RequestBody @Valid UserJoinRequest joinRequest) {
        return joinService.join(joinRequest);
    }
}
