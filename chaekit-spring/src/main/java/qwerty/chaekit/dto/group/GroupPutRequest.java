package qwerty.chaekit.dto.group;

import org.springframework.web.multipart.MultipartFile;

public record GroupPutRequest(
        String description,
        MultipartFile groupImage
) { }
