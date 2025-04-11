package qwerty.chaekit.controller.ebook;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;
import qwerty.chaekit.dto.PublisherInfoResponse;
import qwerty.chaekit.dto.ebook.EbookListResponse;
import qwerty.chaekit.dto.upload.EbookDownloadResponse;
import qwerty.chaekit.dto.upload.EbookUploadRequest;
import qwerty.chaekit.global.response.ApiSuccessResponse;
import qwerty.chaekit.service.AdminService;
import qwerty.chaekit.service.EbookFileService;
import qwerty.chaekit.service.EbookService;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/ebook")
@RequiredArgsConstructor
public class EbookController {
    @GetMapping("/api")
    public ApiSuccessResponse<String> mainApi() {
        return ApiSuccessResponse.of("Welcome to Chaekit");
    }
}
