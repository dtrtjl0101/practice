package qwerty.chaekit.service.ebook;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import qwerty.chaekit.domain.ebook.Ebook;
import qwerty.chaekit.domain.ebook.repository.EbookRepository;
import qwerty.chaekit.domain.member.user.UserProfile;
import qwerty.chaekit.dto.ebook.EbookFetchResponse;
import qwerty.chaekit.dto.page.PageResponse;
import qwerty.chaekit.global.security.resolver.UserToken;
import qwerty.chaekit.service.util.EntityFinder;
import qwerty.chaekit.service.util.FileService;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EbookService {
    private final EbookRepository ebookRepository;
    private final FileService fileService;
    private final EntityFinder entityFinder;

    public PageResponse<EbookFetchResponse> fetchBooksByQuery(UserToken userToken, Pageable pageable, String title, String author) {
        UserProfile user = userToken.isAnonymous() ? null : entityFinder.findUser(userToken.userId());
        Page<EbookFetchResponse> page = ebookRepository.findAllByTitleAndAuthor(title, author, pageable)
                .map( ebook -> EbookFetchResponse.of(
                        ebook, fileService.convertToPublicImageURL(ebook.getCoverImageKey()),
                        user != null && user.isPurchased(ebook)
                ));
        return PageResponse.of(page);
    }

    public EbookFetchResponse fetchById(UserToken userToken, Long ebookId) {
        UserProfile user = entityFinder.findUser(userToken.userId());
        Ebook ebook = entityFinder.findEbook(ebookId);
        return EbookFetchResponse.of(
                ebook,
                fileService.convertToPublicImageURL(ebook.getCoverImageKey()),
                user.isPurchased(ebook)
        );
    }
}
