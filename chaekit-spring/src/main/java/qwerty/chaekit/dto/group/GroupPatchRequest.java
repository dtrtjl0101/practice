package qwerty.chaekit.dto.group;

import org.springframework.web.multipart.MultipartFile;

public record GroupPatchRequest(
        String description,
        MultipartFile groupImage
) { }
