package qwerty.chaekit.dto.group;

import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public record GroupPostRequest(
        String name,
        String description,
        List<String> tags,
        MultipartFile groupImage
) { }
