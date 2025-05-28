package qwerty.chaekit.dto.group.request;

import jakarta.validation.constraints.NotBlank;
import org.hibernate.validator.constraints.Length;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public record GroupPostRequest(
        @NotBlank
        @Length(max = 50)
        String name,
        @NotBlank
        @Length(max = 5000)
        String description,
        List<String> tags,
        MultipartFile groupImage
) { }
