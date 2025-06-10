package qwerty.chaekit.dto.member;

import jakarta.annotation.Nullable;
import org.springframework.web.multipart.MultipartFile;

public record UserPatchRequest(
        @Nullable
        String nickname,
        @Nullable
        MultipartFile profileImage
){ }
