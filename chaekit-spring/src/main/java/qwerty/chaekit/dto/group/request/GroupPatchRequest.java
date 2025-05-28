package qwerty.chaekit.dto.group.request;

import org.hibernate.validator.constraints.Length;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public record GroupPatchRequest(
        @Length(max = 100)
        String name,
        List<String> tags,
        @Length(max = 5000)
        String description,
        MultipartFile groupImage
) { }
