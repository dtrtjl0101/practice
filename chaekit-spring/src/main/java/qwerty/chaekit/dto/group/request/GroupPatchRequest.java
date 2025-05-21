package qwerty.chaekit.dto.group.request;

import org.hibernate.validator.constraints.Length;
import org.springframework.web.multipart.MultipartFile;

public record GroupPatchRequest(
        @Length(max = 5000)
        String description,
        MultipartFile groupImage
) { }
