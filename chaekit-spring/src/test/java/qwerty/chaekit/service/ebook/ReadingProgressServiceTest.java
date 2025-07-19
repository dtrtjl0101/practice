package qwerty.chaekit.service.ebook;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
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
import qwerty.chaekit.service.util.EntityFinder;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReadingProgressServiceTest {

    @InjectMocks
    private ReadingProgressService readingProgressService;

    @Mock
    private EbookPurchaseRepository ebookPurchaseRepository;

    @Mock
    private ActivityMemberRepository activityMemberRepository;

    @Mock
    private ReadingProgressMapper readingProgressMapper;

    @Mock
    private EntityFinder entityFinder;

    @Test
    @DisplayName("독서 진행도 저장 성공")
    void saveMyProgress_Success() {
        // given
        Long userId = 1L;
        Long bookId = 1L;
        String cfi = "epubcfi(/6/4[chap01ref]!/4[body01]/10[para05]/3:10)";
        Long percentage = 50L;

        UserToken userToken = UserToken.of(userId, userId, "test@test.com");
        ReadingProgressRequest request = new ReadingProgressRequest(cfi, percentage);

        UserProfile user = UserProfile.builder()
                .id(userId)
                .build();


        Ebook ebook = Ebook.builder()
                .id(bookId)
                .title("Test Book")
                .author("Test Author")
                .build();

        EbookPurchase ebookPurchase = EbookPurchase.builder()
                .user(user)
                .ebook(ebook)
                .build();

        // when
        when(entityFinder.findUser(userId)).thenReturn(user);
        when(entityFinder.findEbook(bookId)).thenReturn(ebook);
        when(ebookPurchaseRepository.findByUserAndEbook(user, ebook)).thenReturn(Optional.of(ebookPurchase));

        readingProgressService.saveMyProgress(userToken, bookId, request);

        // then
        assertThat(ebookPurchase.getCfi()).isEqualTo(cfi);
        assertThat(ebookPurchase.getPercentage()).isEqualTo(percentage);
    }

    @Test
    @DisplayName("독서 진행도 저장 실패 - 구매하지 않은 이북")
    void saveMyProgress_Failure_NotPurchased() {
        // given
        Long userId = 1L;
        Long bookId = 1L;
        String cfi = "epubcfi(/6/4[chap01ref]!/4[body01]/10[para05]/3:10)";
        Long percentage = 50L;

        UserToken userToken = UserToken.of(userId, userId, "test@test.com");
        ReadingProgressRequest request = new ReadingProgressRequest(cfi, percentage);

        UserProfile user = UserProfile.builder()
                .id(userId)
                .build();


        Ebook ebook = Ebook.builder()
                .id(bookId)
                .title("Test Book")
                .author("Test Author")
                .build();

        // when
        when(entityFinder.findUser(userId)).thenReturn(user);
        when(entityFinder.findEbook(bookId)).thenReturn(ebook);
        when(ebookPurchaseRepository.findByUserAndEbook(user, ebook)).thenReturn(Optional.empty());

        // then
        assertThatThrownBy(() -> readingProgressService.saveMyProgress(userToken, bookId, request))
                .isInstanceOf(ForbiddenException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.EBOOK_NOT_PURCHASED.getCode());
    }

    @Test
    @DisplayName("독서 진행도 조회 성공")
    void getMyProgress_Success() {
        // given
        Long userId = 1L;
        Long bookId = 1L;
        String cfi = "epubcfi(/6/4[chap01ref]!/4[body01]/10[para05]/3:10)";
        Long percentage = 50L;

        UserToken userToken = UserToken.of(userId, userId, "test@test.com");

        UserProfile user = UserProfile.builder()
                .id(userId)
                .build();

        Ebook ebook = Ebook.builder()
                .id(bookId)
                .title("Test Book")
                .author("Test Author")
                .build();

        EbookPurchase ebookPurchase = EbookPurchase.builder()
                .user(user)
                .ebook(ebook)
                .build();
        ebookPurchase.saveProgress(cfi, percentage);

        ReadingProgressResponse expectedResponse = ReadingProgressResponse.builder()
                .bookId(bookId)
                .userId(userId)
                .userNickname("Test User")
                .userProfileImageURL("http://test.com/profile.jpg")
                .cfi(cfi)
                .percentage(percentage)
                .build();

        // when
        when(entityFinder.findUser(userId)).thenReturn(user);
        when(entityFinder.findEbook(bookId)).thenReturn(ebook);
        when(ebookPurchaseRepository.findByUserAndEbook(user, ebook)).thenReturn(Optional.of(ebookPurchase));
        when(readingProgressMapper.toResponse(ebookPurchase)).thenReturn(expectedResponse);

        ReadingProgressResponse response = readingProgressService.getMyProgress(userToken, bookId);

        // then
        assertThat(response).isNotNull();
        assertThat(response.bookId()).isEqualTo(bookId);
        assertThat(response.userId()).isEqualTo(userId);
        assertThat(response.cfi()).isEqualTo(cfi);
        assertThat(response.percentage()).isEqualTo(percentage);
    }

    @Test
    @DisplayName("활동 내 독서 진행도 조회 성공")
    void getProgressFromActivity_Success() {
        // given
        Long activityId = 1L;
        Long bookId = 1L;
        Pageable pageable = PageRequest.of(0, 10);


        Ebook ebook = Ebook.builder()
                .id(bookId)
                .title("Test Book")
                .author("Test Author")
                .build();

        Activity activity = Activity.builder()
                .id(activityId)
                .book(ebook)
                .build();

        UserProfile user1 = UserProfile.builder()
                .id(1L)
                .nickname("User 1")
                .build();

        UserProfile user2 = UserProfile.builder()
                .id(2L)
                .nickname("User 2")
                .build();

        ActivityMember member1 = ActivityMember.builder()
                .activity(activity)
                .user(user1)
                .build();

        ActivityMember member2 = ActivityMember.builder()
                .activity(activity)
                .user(user2)
                .build();

        EbookPurchase purchase1 = EbookPurchase.builder()
                .user(user1)
                .ebook(ebook)
                .build();
        purchase1.saveProgress("cfi1", 30L);

        EbookPurchase purchase2 = EbookPurchase.builder()
                .user(user2)
                .ebook(ebook)
                .build();
        purchase2.saveProgress("cfi2", 60L);

        ReadingProgressResponse response1 = ReadingProgressResponse.builder()
                .bookId(bookId)
                .userId(user1.getId())
                .userNickname(user1.getNickname())
                .cfi("cfi1")
                .percentage(30L)
                .build();

        ReadingProgressResponse response2 = ReadingProgressResponse.builder()
                .bookId(bookId)
                .userId(user2.getId())
                .userNickname(user2.getNickname())
                .cfi("cfi2")
                .percentage(60L)
                .build();

        // when
        when(entityFinder.findActivity(activityId)).thenReturn(activity);
        when(activityMemberRepository.findByActivity(activity, pageable))
                .thenReturn(new PageImpl<>(List.of(member1, member2)));
        when(ebookPurchaseRepository.findByUserIdInAndEbook(List.of(user1.getId(), user2.getId()), ebook))
                .thenReturn(List.of(purchase1, purchase2));
        when(readingProgressMapper.toResponse(purchase1)).thenReturn(response1);
        when(readingProgressMapper.toResponse(purchase2)).thenReturn(response2);

        PageResponse<ReadingProgressResponse> response = readingProgressService.getProgressFromActivity(activityId, pageable);

        // then
        assertThat(response.content()).hasSize(2);
        assertThat(response.content().get(0).userId()).isEqualTo(user1.getId());
        assertThat(response.content().get(0).percentage()).isEqualTo(30L);
        assertThat(response.content().get(1).userId()).isEqualTo(user2.getId());
        assertThat(response.content().get(1).percentage()).isEqualTo(60L);
    }
} 