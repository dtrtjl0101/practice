package qwerty.chaekit.service.member.notification;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {
    private final JavaMailSender javaMailSender;

    // 본인 인증 이메일 전송
    public void sendVerificationEmail(String toEmail, String verificationLink) throws MessagingException {
        String subject = "이메일 본인 인증";
        String text = "<h3>본인 인증을 위해 아래 링크를 클릭하세요.</h3>" +
                "<a href=\"" + verificationLink + "\">본인 인증하기</a>";

        sendEmail(toEmail, subject, text);
    }

    // 출판사 계정 승인 이메일 전송
    public void sendPublisherApprovalEmail(String toEmail) throws MessagingException {
        String subject = "출판사 계정 승인 알림";
        String text = "<h3>축하합니다! 출판사 계정이 승인되었습니다.</h3>" +
                "<p>이제 출판사 계정을 통해 전자책을 업로드할 수 있습니다.</p>";

        sendEmail(toEmail, subject, text);
    }

    // 독서모임 참여 승인 이메일 전송
    public void sendReadingGroupApprovalEmail(String toEmail) throws MessagingException {
        String subject = "독서모임 참여 승인 알림";
        String text = "<h3>축하합니다! 독서모임 참여가 승인되었습니다.</h3>" +
                "<p>모임에 참여하여 책을 함께 읽을 수 있습니다.</p>";

        sendEmail(toEmail, subject, text);
    }

    // 공통된 이메일 전송 메서드
    private void sendEmail(String toEmail, String subject, String text) throws MessagingException {
        MimeMessage message = javaMailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);

        helper.setTo(toEmail);
        helper.setSubject(subject);
        helper.setText(text, true); // true는 HTML 텍스트임을 의미

        javaMailSender.send(message);
    }
}