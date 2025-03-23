package qwerty.chaekit.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;
import qwerty.chaekit.dto.JoinDto;
import qwerty.chaekit.service.JoinService;

@RestController
public class JoinController {
    private final JoinService joinService;

    public JoinController(JoinService joinService){
        this.joinService = joinService;
    }
    @PostMapping("/join")
    public String joinProcess(JoinDto joinDTO) {

        joinService.joinProcess(joinDTO);

        return "ok";
    }
}
