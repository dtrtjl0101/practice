package qwerty.chaekit.dto.group;

import jakarta.validation.constraints.NotBlank;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public record GroupPostRequest(
        @NotBlank
        String name,
        @NotBlank
        String description,
        List<String> tags,
        MultipartFile groupImage
) { }
