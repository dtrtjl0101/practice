package qwerty.chaekit.global.enums;

import lombok.Getter;

import java.util.List;

@Getter
public enum S3Directory {
    EBOOK("ebook/", List.of(".epub"), megaByte(10)),
    EBOOK_COVER_IMAGE("ebook-cover-image/", defaultImageExtensions(), megaByte(5)),
    GROUP_IMAGE("group-image/", defaultImageExtensions(), megaByte(5)),
    PROFILE_IMAGE("profile-image/", defaultImageExtensions(), megaByte(5)),;

    private final String path;
    private final List<String> allowedExtensions;
    private final long maxSize;

    S3Directory(String path, List<String> allowedExtensions, long maxSize) {
        this.path = path;
        this.allowedExtensions = allowedExtensions;
        this.maxSize = maxSize;
    }

    private static List<String> defaultImageExtensions() {
        return List.of(".jpg", ".jpeg", ".png", ".gif", ".bmp", ".tiff", ".webp");
    }

    private static long megaByte(int size) {
        return 1024 * 1024L * size;
    }
}
