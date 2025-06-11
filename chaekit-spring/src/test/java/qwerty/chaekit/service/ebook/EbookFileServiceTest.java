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
import org.springframework.mock.web.MockMultipartFile;
import qwerty.chaekit.domain.ebook.Ebook;
import qwerty.chaekit.domain.ebook.repository.EbookRepository;
import qwerty.chaekit.domain.ebook.request.EbookRequest;
import qwerty.chaekit.domain.ebook.request.EbookRequestRepository;
import qwerty.chaekit.domain.ebook.request.EbookRequestStatus;
import qwerty.chaekit.domain.member.Member;
import qwerty.chaekit.domain.member.enums.Role;
import qwerty.chaekit.domain.member.publisher.PublisherProfile;
import qwerty.chaekit.domain.member.publisher.enums.PublisherApprovalStatus;
import qwerty.chaekit.domain.member.user.UserProfile;
import qwerty.chaekit.dto.ebook.request.EbookRequestFetchResponse;
import qwerty.chaekit.dto.ebook.request.EbookRequestRejectRequest;
import qwerty.chaekit.dto.ebook.upload.EbookDownloadResponse;
import qwerty.chaekit.dto.ebook.upload.EbookPostRequest;
import qwerty.chaekit.dto.ebook.upload.EbookPostResponse;
import qwerty.chaekit.dto.page.PageResponse;
import qwerty.chaekit.global.enums.ErrorCode;
import qwerty.chaekit.global.exception.BadRequestException;
import qwerty.chaekit.global.exception.ForbiddenException;
import qwerty.chaekit.global.security.resolver.PublisherToken;
import qwerty.chaekit.global.security.resolver.UserToken;
import qwerty.chaekit.mapper.EbookRequestMapper;
import qwerty.chaekit.service.util.EmailNotificationService;
import qwerty.chaekit.service.util.EntityFinder;
import qwerty.chaekit.service.util.FileService;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EbookFileServiceTest {

    @InjectMocks
    private EbookFileService ebookFileService;

    @Mock
    private EbookRepository ebookRepository;
    @Mock
    private EbookPolicy ebookPolicy;
    @Mock
    private FileService fileService;
    @Mock
    private EntityFinder entityFinder;
    @Mock
    private EbookRequestRepository ebookRequestRepository;
    @Mock
    private EbookRequestMapper ebookRequestMapper;
    @Mock
    private EmailNotificationService emailNotificationService;

    @Test
    @DisplayName("이북 업로드 성공 - 일반 출판사")
    void uploadEbook_Success_RegularPublisher() {
        // given
        Long publisherId = 1L;
        Long memberId = 1L;
        String email = "test@test.com";
        PublisherToken publisherToken = PublisherToken.of(memberId, publisherId, email);
        
        Member member = Member.builder()
                .id(memberId)
                .email(email)
                .role(Role.ROLE_PUBLISHER)
                .build();
                
        PublisherProfile publisher = PublisherProfile.builder()
                .id(publisherId)
                .member(member)
                .publisherName("Test Publisher")
                .build();
        publisher.approvePublisher();

        MockMultipartFile file = new MockMultipartFile(
                "file", "test.epub", "application/epub+zip", "test content".getBytes()
        );
        MockMultipartFile coverImage = new MockMultipartFile(
                "coverImage", "cover.jpg", "image/jpeg", "cover content".getBytes()
        );

        EbookPostRequest request = new EbookPostRequest(
                "Test Book", "Test Author", "Test Description", file, 1000, coverImage
        );

        EbookRequest ebookRequest = EbookRequest.builder()
                .id(1L)
                .title(request.title())
                .author(request.author())
                .description(request.description())
                .size(request.file().getSize())
                .price(request.price())
                .fileKey("test-file-key")
                .coverImageKey("test-cover-key")
                .publisher(publisher)
                .build();

        Ebook ebook = Ebook.builder()
                .id(1L)
                .title(request.title())
                .author(request.author())
                .description(request.description())
                .size(request.file().getSize())
                .price(request.price())
                .fileKey("test-file-key")
                .coverImageKey("test-cover-key")
                .publisher(publisher)
                .build();

        when(entityFinder.findPublisher(publisherId)).thenReturn(publisher);
        when(fileService.uploadEbook(any())).thenReturn("test-file-key");
        when(fileService.uploadEbookCoverImageIfPresent(any())).thenReturn("test-cover-key");
        when(fileService.convertToPublicImageURL(any())).thenReturn("http://test.com/cover.jpg");
        when(ebookRequestRepository.save(any())).thenReturn(ebookRequest);

        // when
        EbookPostResponse response = ebookFileService.uploadEbook(publisherToken, request);

        // then
        assertThat(response).isNotNull();
        assertThat(response.title()).isEqualTo(request.title());
        assertThat(response.author()).isEqualTo(request.author());
        assertThat(response.description()).isEqualTo(request.description());
        assertThat(response.coverImageURL()).isEqualTo("http://test.com/cover.jpg");
        verify(ebookRequestRepository).save(any(EbookRequest.class));
    }

    @Test
    @DisplayName("이북 업로드 실패 - 미승인 출판사")
    void uploadEbook_Failure_UnapprovedPublisher() {
        // given
        Long publisherId = 1L;
        Long memberId = 1L;
        String email = "test@test.com";
        PublisherToken publisherToken = PublisherToken.of(memberId, publisherId, email);
        
        Member member = Member.builder()
                .id(memberId)
                .email(email)
                .role(Role.ROLE_PUBLISHER)
                .build();
                
        PublisherProfile publisher = PublisherProfile.builder()
                .id(publisherId)
                .member(member)
                .publisherName("Test Publisher")
                //.approvalStatus(PublisherApprovalStatus.PENDING)
                .build();

        MockMultipartFile file = new MockMultipartFile(
                "file", "test.epub", "application/epub+zip", "test content".getBytes()
        );
        EbookPostRequest request = new EbookPostRequest(
                "Test Book", "Test Author", "Test Description", file, 1000, null
        );

        when(entityFinder.findPublisher(publisherId)).thenReturn(publisher);

        // when & then
        assertThatThrownBy(() -> ebookFileService.uploadEbook(publisherToken, request))
                .isInstanceOf(ForbiddenException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.PUBLISHER_NOT_APPROVED.getCode());
    }

    @Test
    @DisplayName("이북 다운로드 URL 조회 성공 - 사용자")
    void getPresignedEbookUrlForUser_Success() {
        // given
        Long userId = 1L;
        Long ebookId = 1L;
        UserToken userToken = UserToken.of(userId, userId, "user@test.com");
        UserProfile user = UserProfile.builder().id(userId).build();
        Ebook ebook = Ebook.builder()
                .id(ebookId)
                .fileKey("test-file-key")
                .build();

        when(entityFinder.findUser(userId)).thenReturn(user);
        when(entityFinder.findEbook(ebookId)).thenReturn(ebook);
        when(fileService.getEbookDownloadUrl("test-file-key")).thenReturn("http://test.com/download");

        // when
        EbookDownloadResponse response = ebookFileService.getPresignedEbookUrlForUser(userToken, ebookId);

        // then
        assertThat(response.presignedUrl()).isEqualTo("http://test.com/download");
        verify(ebookPolicy).assertEBookPurchased(user, ebook);
    }

    @Test
    @DisplayName("이북 다운로드 URL 조회 성공 - 출판사")
    void getPresignedEbookUrlForPublisher_Success() {
        // given
        Long publisherId = 1L;
        Long memberId = 1L;
        String email = "test@test.com";
        PublisherToken publisherToken = PublisherToken.of(memberId, publisherId, email);
        
        PublisherProfile publisher = PublisherProfile.builder()
                .id(publisherId)
                .publisherName("Test Publisher")
                .build();
                
        Ebook ebook = Ebook.builder()
                .id(1L)
                .fileKey("test-file-key")
                .publisher(publisher)
                .build();

        when(entityFinder.findPublisher(publisherId)).thenReturn(publisher);
        when(entityFinder.findEbook(1L)).thenReturn(ebook);
        when(fileService.getEbookDownloadUrl("test-file-key")).thenReturn("http://test.com/download");

        // when
        EbookDownloadResponse response = ebookFileService.getPresignedEbookUrlForPublisher(publisherToken, 1L);

        // then
        assertThat(response.presignedUrl()).isEqualTo("http://test.com/download");
    }

    @Test
    @DisplayName("이북 요청 목록 조회 성공 - 일반 출판사")
    void getEbookRequests_Success_RegularPublisher() {
        // given
        Long publisherId = 1L;
        Long memberId = 1L;
        String email = "test@test.com";
        PublisherToken publisherToken = PublisherToken.of(memberId, publisherId, email);
        
        Member member = Member.builder()
                .id(memberId)
                .email(email)
                .role(Role.ROLE_PUBLISHER)
                .build();
                
        PublisherProfile publisher = PublisherProfile.builder()
                .id(publisherId)
                .member(member)
                .publisherName("Test Publisher")
                .build();
                
        Pageable pageable = PageRequest.of(0, 10);

        EbookRequest request = EbookRequest.builder()
                .id(1L)
                .title("Test Book")
                .author("Test Author")
                .publisher(publisher)
                .build();

        EbookRequestFetchResponse response = EbookRequestFetchResponse.builder()
                .requestId(1L)
                .title("Test Book")
                .author("Test Author")
                .description("Test Description")
                .size(1000L)
                .price(1000)
                .coverImageURL("http://test.com/cover.jpg")
                .publisherId(publisherId)
                .publisherName("Test Publisher")
                .publisherEmail(email)
                .status(EbookRequestStatus.PENDING)
                .build();

        when(entityFinder.findPublisher(publisherId)).thenReturn(publisher);
        when(ebookRequestRepository.findByPublisher(publisher, pageable))
                .thenReturn(new PageImpl<>(List.of(request)));
        when(ebookRequestMapper.toFetchResponse(request)).thenReturn(response);

        // when
        PageResponse<EbookRequestFetchResponse> result = ebookFileService.getEbookRequests(publisherToken, pageable);

        // then
        assertThat(result.content()).hasSize(1);
        assertThat(result.content().get(0)).isEqualTo(response);
    }

    @Test
    @DisplayName("이북 요청 거절 성공 - 관리자")
    void rejectEbookByAdmin_Success() {
        // given
        Long publisherId = 1L;
        Long memberId = 1L;
        String email = "admin@test.com";
        PublisherToken publisherToken = PublisherToken.of(memberId, publisherId, email);
        
        Member member = Member.builder()
                .id(memberId)
                .email(email)
                .role(Role.ROLE_ADMIN)
                .build();
                
        PublisherProfile publisher = PublisherProfile.builder()
                .id(publisherId)
                .member(member)
                .publisherName("Test Publisher")
                //.approvalStatus(PublisherApprovalStatus.APPROVED)
                .build();

        EbookRequest request = EbookRequest.builder()
                .id(1L)
                .title("Test Book")
                .author("Test Author")
                .publisher(publisher)
                .build();

        EbookRequestRejectRequest rejectRequest = new EbookRequestRejectRequest("부적절한 내용");

        when(entityFinder.findPublisher(publisherId)).thenReturn(publisher);
        when(entityFinder.findEbookRequest(1L)).thenReturn(request);

        // when
        ebookFileService.rejectEbookByAdmin(publisherToken, 1L, rejectRequest);

        // then
        verify(emailNotificationService).sendEbookRejectionEmail(email, "부적절한 내용");
    }



    @Test
    @DisplayName("임시 전자책 다운로드 URL 생성 성공 - 관리자")
    void getPresignedTempEbookUrlForPublisher_Success_Admin() {
        // given
        Long publisherId = 1L;
        Long requestId = 1L;
        String fileKey = "test/file.epub";
        String expectedUrl = "https://test-bucket.s3.amazonaws.com/test/file.epub";

        PublisherProfile publisher = mock(PublisherProfile.class);
        EbookRequest ebookRequest = mock(EbookRequest.class);

        when(entityFinder.findPublisher(publisherId)).thenReturn(publisher);
        when(entityFinder.findEbookRequest(requestId)).thenReturn(ebookRequest);
        when(publisher.isNotAdmin()).thenReturn(false);
        when(ebookRequest.getFileKey()).thenReturn(fileKey);
        when(fileService.getEbookDownloadUrl(fileKey)).thenReturn(expectedUrl);

        // when
        EbookDownloadResponse response = ebookFileService.getPresignedTempEbookUrlForPublisher(
                new PublisherToken(null, publisherId, null), requestId);

        // then
        assertThat(response.presignedUrl()).isEqualTo(expectedUrl);
        verify(entityFinder).findPublisher(publisherId);
        verify(entityFinder).findEbookRequest(requestId);
        verify(fileService).getEbookDownloadUrl(fileKey);
    }

    @Test
    @DisplayName("임시 전자책 다운로드 URL 생성 실패 - 권한 없음")
    void getPresignedTempEbookUrlForPublisher_Failure_NoPermission() {
        // given
        Long publisherId = 1L;
        Long requestId = 1L;

        PublisherProfile publisher = mock(PublisherProfile.class);
        EbookRequest ebookRequest = mock(EbookRequest.class);

        when(entityFinder.findPublisher(publisherId)).thenReturn(publisher);
        when(entityFinder.findEbookRequest(requestId)).thenReturn(ebookRequest);
        when(publisher.isNotAdmin()).thenReturn(true);
        when(ebookRequest.isRequestedBy(publisher)).thenReturn(false);

        // when & then
        assertThatThrownBy(() -> ebookFileService.getPresignedTempEbookUrlForPublisher(
                new PublisherToken(null, publisherId, null), requestId))
                .isInstanceOf(ForbiddenException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.EBOOK_REQUEST_NOT_YOURS.getCode());
    }

    @Test
    @DisplayName("전자책 승인 성공")
    void approveEbookByAdmin_Success() {
        // given
        Long publisherId = 1L;
        Long requestId = 1L;

        PublisherProfile publisher = mock(PublisherProfile.class);
        EbookRequest request = mock(EbookRequest.class);
        Ebook ebook = mock(Ebook.class);

        when(entityFinder.findPublisher(publisherId)).thenReturn(publisher);
        when(entityFinder.findEbookRequest(requestId)).thenReturn(request);
        when(publisher.isNotAdmin()).thenReturn(false);
        when(request.isNotPending()).thenReturn(false);
        when(request.toEbook()).thenReturn(ebook);
        when(ebookRepository.save(any(Ebook.class))).thenReturn(ebook);

        // when
        ebookFileService.approveEbookByAdmin(new PublisherToken(null, publisherId, null), requestId);

        // then
        verify(entityFinder).findPublisher(publisherId);
        verify(entityFinder).findEbookRequest(requestId);
        verify(ebookRepository).save(any(Ebook.class));
        verify(request).approve(ebook);
    }

    @Test
    @DisplayName("전자책 승인 실패 - 관리자 아님")
    void approveEbookByAdmin_Failure_NotAdmin() {
        // given
        Long publisherId = 1L;
        Long requestId = 1L;

        PublisherProfile publisher = mock(PublisherProfile.class);
        EbookRequest request = mock(EbookRequest.class);

        when(entityFinder.findPublisher(publisherId)).thenReturn(publisher);
        when(entityFinder.findEbookRequest(requestId)).thenReturn(request);
        when(publisher.isNotAdmin()).thenReturn(true);

        // when & then
        assertThatThrownBy(() -> ebookFileService.approveEbookByAdmin(
                new PublisherToken(null, publisherId, null), requestId))
                .isInstanceOf(ForbiddenException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.ONLY_ADMIN.getCode());
    }

    @Test
    @DisplayName("전자책 승인 실패 - 대기 상태 아님")
    void approveEbookByAdmin_Failure_NotPending() {
        // given
        Long publisherId = 1L;
        Long requestId = 1L;

        PublisherProfile publisher = mock(PublisherProfile.class);
        EbookRequest request = mock(EbookRequest.class);

        when(entityFinder.findPublisher(publisherId)).thenReturn(publisher);
        when(entityFinder.findEbookRequest(requestId)).thenReturn(request);
        when(publisher.isNotAdmin()).thenReturn(false);
        when(request.isNotPending()).thenReturn(true);

        // when & then
        assertThatThrownBy(() -> ebookFileService.approveEbookByAdmin(
                new PublisherToken(null, publisherId, null), requestId))
                .isInstanceOf(BadRequestException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.EBOOK_REQUEST_NOT_PENDING.getCode());
    }
} 