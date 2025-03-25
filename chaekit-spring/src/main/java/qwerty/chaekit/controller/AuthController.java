package qwerty.chaekit.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AuthController {
    @GetMapping("/admin")
    public String admin() {
        return "Admin Controller";
    }
}
