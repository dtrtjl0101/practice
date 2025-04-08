package qwerty.chaekit.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import qwerty.chaekit.global.response.ApiSuccessResponse;

@RestController
public class MainController {
    @GetMapping("/api")
    public ApiSuccessResponse<String> mainApi() {
        return ApiSuccessResponse.of("Welcome to Chaekit");
    }
}
