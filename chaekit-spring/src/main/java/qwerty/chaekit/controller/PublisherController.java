package qwerty.chaekit.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import qwerty.chaekit.dto.PublisherJoinRequest;
import qwerty.chaekit.dto.PublisherJoinResponse;
import qwerty.chaekit.service.PublisherJoinService;

@RestController
@RequestMapping("/api/publishers")
@RequiredArgsConstructor
public class PublisherController {
    private final PublisherJoinService joinService;
    @GetMapping("/me")
    public String publisherInfo() {
        return "TODO...";
    }

    @PostMapping("/join")
    public PublisherJoinResponse publisherJoin(@RequestBody @Valid PublisherJoinRequest joinRequest) {
        return joinService.join(joinRequest);
    }
}
