package qwerty.chaekit.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import qwerty.chaekit.dto.UserJoinRequest;
import qwerty.chaekit.dto.UserJoinResponse;
import qwerty.chaekit.service.UserJoinService;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserJoinService joinService;
    @GetMapping("/me")
    public String userInfo() {
        return "TODO...";
    }

    @PostMapping("/join")
    public UserJoinResponse userJoin(@RequestBody @Valid UserJoinRequest joinRequest) {
        return joinService.join(joinRequest);
    }
}
