package qwerty.chaekit.service.ebook;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import qwerty.chaekit.domain.ebook.Ebook;
import qwerty.chaekit.domain.ebook.purchase.EbookPurchase;
import qwerty.chaekit.domain.ebook.purchase.repository.EbookPurchaseRepository;
import qwerty.chaekit.domain.group.activity.Activity;
import qwerty.chaekit.domain.group.activity.activitymember.ActivityMember;
import qwerty.chaekit.domain.group.activity.activitymember.ActivityMemberRepository;
import qwerty.chaekit.domain.member.user.UserProfile;
import qwerty.chaekit.dto.ebook.purchase.ReadingProgressRequest;
import qwerty.chaekit.dto.ebook.purchase.ReadingProgressResponse;
import qwerty.chaekit.dto.page.PageResponse;
import qwerty.chaekit.global.enums.ErrorCode;
import qwerty.chaekit.global.exception.ForbiddenException;
import qwerty.chaekit.global.security.resolver.UserToken;
import qwerty.chaekit.mapper.ReadingProgressMapper;
import qwerty.chaekit.service.group.ActivityPolicy;
import qwerty.chaekit.service.util.EntityFinder;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ReadingProgressService {
    
    private final EbookPurchaseRepository ebookPurchaseRepository;
    private final ActivityMemberRepository activityMemberRepository;
    private final ReadingProgressMapper readingProgressMapper;
    private final ActivityPolicy activityPolicy;
    private final EntityFinder entityFinder;


    @Transactional
    public void saveMyProgress(UserToken userToken, Long bookId, ReadingProgressRequest request) {
        UserProfile user = entityFinder.findUser(userToken.userId());
        Ebook ebook = entityFinder.findEbook(bookId);

        EbookPurchase ebookPurchase = ebookPurchaseRepository.findByUserAndEbook(user, ebook)
                .orElseThrow(() -> new ForbiddenException(ErrorCode.EBOOK_NOT_PURCHASED));

        ebookPurchase.saveProgress(request.cfi(), request.percentage());
    }

    public ReadingProgressResponse getMyProgress(UserToken userToken, Long bookId) {
        UserProfile user = entityFinder.findUser(userToken.userId());
        Ebook ebook = entityFinder.findEbook(bookId);

        EbookPurchase ebookPurchase = ebookPurchaseRepository.findByUserAndEbook(user,ebook)
                .orElseThrow(() -> new ForbiddenException(ErrorCode.EBOOK_NOT_PURCHASED));

        return readingProgressMapper.toResponse(ebookPurchase);
    }

    public PageResponse<ReadingProgressResponse> getProgressFromActivity(UserToken userToken, Long activityId, Pageable pageable) {
        UserProfile user = entityFinder.findUser(userToken.userId());
        Activity activity = entityFinder.findActivity(activityId);

        activityPolicy.assertJoined(user, activity);

        Page<ActivityMember> activityMembers = activityMemberRepository.findByActivity(activity, pageable);
        List<Long> userIdList = activityMembers
                .map(activityMember -> activityMember.getUser().getId())
                .stream().toList();
        List<EbookPurchase> purchaseList = ebookPurchaseRepository.findByUserIdIn(userIdList);
        Page<EbookPurchase> ebookPurchases = new PageImpl<>(purchaseList, pageable, activityMembers.getTotalElements());

        return PageResponse.of(ebookPurchases.map(readingProgressMapper::toResponse));
    }
}