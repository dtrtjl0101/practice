package qwerty.chaekit.service.ebook;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.multipart.MultipartFile;
import qwerty.chaekit.domain.ebook.Ebook;
import qwerty.chaekit.domain.ebook.repository.EbookRepository;
import qwerty.chaekit.domain.member.publisher.PublisherProfile;
import qwerty.chaekit.domain.member.publisher.PublisherProfileRepository;
import qwerty.chaekit.dto.ebook.upload.EbookDownloadResponse;
import qwerty.chaekit.dto.ebook.upload.EbookPostRequest;
import qwerty.chaekit.dto.ebook.upload.EbookPostResponse;
import qwerty.chaekit.global.enums.ErrorCode;
import qwerty.chaekit.global.enums.S3Directory;
import qwerty.chaekit.global.exception.NotFoundException;
import qwerty.chaekit.global.properties.AwsProperties;
import qwerty.chaekit.global.security.resolver.PublisherToken;
import qwerty.chaekit.global.security.resolver.UserToken;
import qwerty.chaekit.service.member.admin.AdminService;
import qwerty.chaekit.service.util.S3Service;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EbookFileServiceTest {
    @InjectMocks
    private EbookFileService ebookFileService;

    @Mock
    private EbookRepository ebookRepository;

    @Mock
    private S3Service s3Service;

    @Mock
    private AwsProperties awsProperties;

    @Mock
    private PublisherProfileRepository publisherRepository;

    @Mock
    private AdminService adminService;

    private final String ebookBucket = "ebook-bucket";
    private final String imageBucket = "image-bucket";
    private final String dummyEmail = "test@example.com";


    @Test
    void uploadEbook_success() {
        Long memberId = 1L;
        Long publisherId = 1L;
        // Arrange
        PublisherToken publisherToken = new PublisherToken(memberId, publisherId , dummyEmail);
        EbookPostRequest request = mock(EbookPostRequest.class);
        PublisherProfile publisherProfile = mock(PublisherProfile.class);

        when(awsProperties.ebookBucketName()).thenReturn(ebookBucket);
        when(awsProperties.imageBucketName()).thenReturn(imageBucket);
        when(request.file()).thenReturn(mock(MultipartFile.class));
        when(request.coverImageFile()).thenReturn(mock(MultipartFile.class));
        when(request.title()).thenReturn("Test Title");
        when(request.author()).thenReturn("Test Author");
        when(request.description()).thenReturn("Test Description");
        when(request.file().getSize()).thenReturn(12345L);
        when(s3Service.uploadFile(ebookBucket, S3Directory.EBOOK, request.file())).thenReturn("file-key");
        when(s3Service.uploadFile(imageBucket, S3Directory.EBOOK_COVER_IMAGE, request.coverImageFile(), false)).thenReturn("cover-image-key");
        when(s3Service.convertToPublicImageURL("cover-image-key")).thenReturn("http://image-url");
        when(publisherRepository.getReferenceById(publisherId)).thenReturn(publisherProfile);

        Ebook ebook = Ebook.builder()
                .id(5L)
                .title("Test Title")
                .author("Test Author")
                .description("Test Description")
                .size(12345L)
                .fileKey("file-key")
                .coverImageKey("cover-image-key")
                .publisher(publisherProfile)
                .build();
        when(ebookRepository.save(any(Ebook.class))).thenReturn(ebook);

        // Act
        EbookPostResponse response = ebookFileService.uploadEbook(publisherToken, request);

        // Assert
        assertNotNull(response);
        assertEquals(5L, response.bookId());
        assertEquals("Test Title", response.title());
        assertEquals("Test Author", response.author());
        assertEquals("Test Description", response.description());
        assertEquals("http://image-url", response.coverImageURL());
        verify(s3Service, times(1)).uploadFile(anyString(), eq(S3Directory.EBOOK), any());
    }

    @Test
    void uploadEbook_missingCoverImage() {
        Long memberId = 1L;
        Long publisherId = 1L;
        // Arrange
        PublisherToken publisherToken = new PublisherToken(memberId, publisherId, dummyEmail);
        EbookPostRequest request = mock(EbookPostRequest.class);
        PublisherProfile publisherProfile = mock(PublisherProfile.class);

        when(awsProperties.ebookBucketName()).thenReturn(ebookBucket);
        when(awsProperties.imageBucketName()).thenReturn(imageBucket);
        when(request.file()).thenReturn(mock(MultipartFile.class));
        when(request.coverImageFile()).thenReturn(null); // coverImageFile이 null인 경우
        when(s3Service.uploadFile(eq(ebookBucket), eq(S3Directory.EBOOK), any()))
                .thenReturn("file-key");
        when(s3Service.uploadFile(eq(imageBucket), eq(S3Directory.EBOOK_COVER_IMAGE), isNull(), eq(false)))
                .thenReturn(null); // coverImageKey가 null 반환
        when(publisherRepository.getReferenceById(publisherId)).thenReturn(publisherProfile);

        Ebook ebook = Ebook.builder()
                .id(4L)
                .title("Test Title")
                .author("Test Author")
                .description("Test Description")
                .size(12345L)
                .fileKey("file-key")
                .coverImageKey(null) // coverImageKey가 null
                .publisher(publisherProfile)
                .build();
        when(ebookRepository.save(any(Ebook.class))).thenReturn(ebook);

        // Act
        EbookPostResponse response = ebookFileService.uploadEbook(publisherToken, request);

        // Assert
        assertNotNull(response);
        assertNull(response.coverImageURL()); // coverImageURL이 null인지 확인
        verify(s3Service, times(1)).uploadFile(eq(ebookBucket), eq(S3Directory.EBOOK), any());
        verify(s3Service, times(1)).uploadFile(eq(imageBucket), eq(S3Directory.EBOOK_COVER_IMAGE), isNull(), eq(false));
    }

    @Test
    void getPresignedEbookUrl_success() {
        Long bookId = 1L;
        Long memberId = 1L;
        Long userId = 1L;
        Long adminId = 1L;
        String fileKey = "file-key";
        // Arrange
        UserToken userToken = new UserToken(false, memberId, userId, dummyEmail);
        Ebook ebook = mock(Ebook.class);

        when(adminService.getAdminUserId()).thenReturn(adminId);
        when(ebookRepository.findById(bookId)).thenReturn(Optional.of(ebook));
        when(ebook.getFileKey()).thenReturn(fileKey);
        when(awsProperties.ebookBucketName()).thenReturn(ebookBucket);
        when(s3Service.getPresignedDownloadUrl(ebookBucket, fileKey)).thenReturn("http://download-url");

        // Act
        EbookDownloadResponse response = ebookFileService.getPresignedEbookUrl(userToken, bookId);

        // Assert
        assertNotNull(response);
        assertEquals("http://download-url", response.presignedUrl());
    }

    @Test
    void getPresignedEbookUrl_ebookNotFound() {
        // Arrange
        Long bookId = 1L;
        Long memberId = 1L;
        Long userId = 1L;
        Long adminId = 1L;
        UserToken userToken = new UserToken(false, memberId, userId, dummyEmail);

        when(adminService.getAdminUserId()).thenReturn(adminId);
        when(ebookRepository.findById(bookId)).thenReturn(Optional.empty());

        // Act & Assert
        NotFoundException exception = assertThrows(NotFoundException.class, () -> ebookFileService.getPresignedEbookUrl(userToken, bookId));
        assertEquals(ErrorCode.EBOOK_NOT_FOUND.getCode(), exception.getErrorCode());
    }
}
