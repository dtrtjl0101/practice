package qwerty.chaekit.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import qwerty.chaekit.global.response.ApiSuccessResponse;

@Slf4j
@RestController
public class MainController {
    @GetMapping("/api")
    public ApiSuccessResponse<String> mainApi() {
        log.info("Health check API called");
        return ApiSuccessResponse.of("Welcome to Chaekit");
    }
}
