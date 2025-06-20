package qwerty.chaekit.controller;

import io.swagger.v3.oas.annotations.Operation;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import qwerty.chaekit.global.response.ApiSuccessResponse;

@Slf4j
@RestController
public class MainController {
    @Operation(
            summary = "메인 API",
            description = "Chaekit 메인 API로, health check를 위해서 사용할 수 있습니다."
    )
    @GetMapping("/api")
    public ApiSuccessResponse<String> mainApi() {
        return ApiSuccessResponse.of("Welcome to Chaekit");
    }
}
