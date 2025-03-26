package qwerty.chaekit.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import qwerty.chaekit.dto.JoinRequest;
import qwerty.chaekit.service.JoinService;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final JoinService joinService;
    @GetMapping("/me")
    public String userInfo() {
        return "TODO...";
    }

    @PostMapping("/join")
    public String userJoin(@RequestBody JoinRequest joinRequest) {
        joinService.joinProcess(joinRequest);
        return "ok";
    }
}
