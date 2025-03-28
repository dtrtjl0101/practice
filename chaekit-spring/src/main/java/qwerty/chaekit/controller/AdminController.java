package qwerty.chaekit.controller;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {
    @GetMapping("/publishers/pending")
    public String fetchPendingList() {
        return "TODO";
    }

    @PostMapping("/publishers/{id}/accept")
    public String acceptPublisher(@PathVariable int id) {
        return "TODO";
    }
}
