package qwerty.chaekit.dto.ebook.upload;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.hibernate.validator.constraints.Length;
import org.springframework.web.multipart.MultipartFile;

public record EbookPostRequest(
        @Schema(description = "책 제목", example = "이상한 나라의 앨리스")
        @NotBlank
        @Length(max=255)
        String title,

        @Schema(description = "책 저자", example = "루이스 캐럴")
        @NotBlank
        @Length(max=50)
        String author,

        @Schema(description = "책 설명", example = "《이상한 나라의 앨리스》는 영국의 수학자이자 작가인 찰스 루트위지 도지슨이 루이스 캐럴이라는 필명으로 1865년에 발표한 소설이다.")
        @Length(max=10000)
        String description,

        @Schema(description = "책 파일", example = "Alice.epub", type = "string", format = "binary")
        @NotNull
        MultipartFile file,

        @Schema(description = "책 가격" , example = "10000")
        @NotNull
        int price,

        @Schema(description = "책 표지 이미지", example = "cover.jpg", type = "string", format = "binary")
        MultipartFile coverImageFile
) {
}
