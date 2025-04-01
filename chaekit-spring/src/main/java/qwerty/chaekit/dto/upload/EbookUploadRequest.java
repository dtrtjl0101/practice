package qwerty.chaekit.dto.upload;

import org.springframework.web.multipart.MultipartFile;

public record EbookUploadRequest(
        String title,
        String author,
        String description,
        MultipartFile file
) {
}
