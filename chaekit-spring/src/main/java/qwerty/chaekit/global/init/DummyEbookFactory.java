package qwerty.chaekit.global.init;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import qwerty.chaekit.domain.ebook.Ebook;
import qwerty.chaekit.domain.ebook.repository.EbookRepository;
import qwerty.chaekit.domain.member.publisher.PublisherProfile;
import qwerty.chaekit.global.init.dummy.DummyEbook;
import qwerty.chaekit.service.member.admin.AdminService;

@Slf4j
@Component
@RequiredArgsConstructor
public class DummyEbookFactory {
    private final EbookRepository ebookRepository;
    private final AdminService adminService;
    
    public void saveDummyEbooks() {
        saveDummyEbook(DummyEbook.ALICE);
        saveDummyEbook(DummyEbook.ROMEO_AND_JULIET);
        saveDummyEbook(DummyEbook.MOBY_D);
        saveDummyEbook(DummyEbook.CINDERELLA);
        saveDummyEbook(DummyEbook.FRANKENSTEIN);
    }

    private void saveDummyEbook(DummyEbook ebookData) {
        if (ebookRepository.existsByTitle(ebookData.getTitle())) {
            log.info("\"{}\"이 이미 존재합니다.", ebookData.getTitle());
            return;
        }
        Ebook ebook = toEbook(ebookData);
        ebookRepository.save(ebook);
        log.info("\"{}\"이 새로 생성되었습니다.", ebookData.getTitle());
    }

    private Ebook toEbook(DummyEbook ebookData) {
        return Ebook.builder()
                .title(ebookData.getTitle())
                .author(ebookData.getAuthor())
                .publisher(PublisherProfile.builder().id(2L).build())
                .description(ebookData.getDescription())
                .fileKey(ebookData.getFileKey())
                .coverImageKey(ebookData.getCoverImageKey())
                .size(ebookData.getSize())
                .price(ebookData.getPrice())
                .build();
    }
    
}
