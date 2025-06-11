package qwerty.chaekit.service.util;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmailNotificationServiceTest{

    @InjectMocks
    private EmailNotificationService emailNotificationService;

    @Mock
    private JavaMailSender javaMailSender;

    @Mock
    private MimeMessage mimeMessage;

    @Test
    void sendVerificationEmail_성공() throws MessagingException {
        // given
        String toEmail = "test@example.com";
        String verificationCode = "123456";
        when(javaMailSender.createMimeMessage()).thenReturn(mimeMessage);

        // when
        emailNotificationService.sendVerificationEmail(toEmail, verificationCode);

        // then
        verify(javaMailSender).send(any(MimeMessage.class));
    }

    @Test
    void sendPublisherApprovalEmail_성공() throws MessagingException {
        // given
        String toEmail = "publisher@example.com";
        when(javaMailSender.createMimeMessage()).thenReturn(mimeMessage);

        // when
        emailNotificationService.sendPublisherApprovalEmail(toEmail);

        // then
        verify(javaMailSender).send(any(MimeMessage.class));
    }

    @Test
    void sendReadingGroupApprovalEmail_성공() throws MessagingException {
        // given
        String toEmail = "user@example.com";
        when(javaMailSender.createMimeMessage()).thenReturn(mimeMessage);

        // when
        emailNotificationService.sendReadingGroupApprovalEmail(toEmail);

        // then
        verify(javaMailSender).send(any(MimeMessage.class));
    }

    @Test
    void sendPublisherRejectionEmail_성공() throws MessagingException {
        // given
        String toEmail = "publisher@example.com";
        String reason = "서류 미비";
        when(javaMailSender.createMimeMessage()).thenReturn(mimeMessage);

        // when
        emailNotificationService.sendPublisherRejectionEmail(toEmail, reason);

        // then
        verify(javaMailSender).send(any(MimeMessage.class));
    }

    @Test
    void sendEbookRejectionEmail_성공() throws MessagingException {
        // given
        String toEmail = "publisher@example.com";
        String reason = "내용 부적절";
        when(javaMailSender.createMimeMessage()).thenReturn(mimeMessage);

        // when
        emailNotificationService.sendEbookRejectionEmail(toEmail, reason);

        // then
        verify(javaMailSender).send(any(MimeMessage.class));
    }

    @Test
    void sendEmail_실패_예외_발생() {
        // given
        String toEmail = "test@example.com";
        String verificationCode = "123456";
        when(javaMailSender.createMimeMessage()).thenThrow(new RuntimeException("메일 전송 실패"));

        // when
        emailNotificationService.sendVerificationEmail(toEmail, verificationCode);

        // then
        verify(javaMailSender, never()).send(any(MimeMessage.class));
    }
} 