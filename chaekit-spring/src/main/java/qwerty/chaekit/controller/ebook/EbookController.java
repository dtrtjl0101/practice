package qwerty.chaekit.controller.ebook;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import qwerty.chaekit.global.response.ApiSuccessResponse;

@RestController
@RequestMapping("/api/ebook")
@RequiredArgsConstructor
public class EbookController {
    @GetMapping("/api")
    public ApiSuccessResponse<String> mainApi() {
        return ApiSuccessResponse.of("Welcome to Chaekit");
    }
}
