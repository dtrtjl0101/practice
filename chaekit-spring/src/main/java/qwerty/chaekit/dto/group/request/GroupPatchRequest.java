package qwerty.chaekit.dto.group.request;

import org.springframework.web.multipart.MultipartFile;

public record GroupPatchRequest(
        String description,
        MultipartFile groupImage
) { }
