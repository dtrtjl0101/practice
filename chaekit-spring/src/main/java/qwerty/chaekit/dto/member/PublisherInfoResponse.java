//package qwerty.chaekit.dto.member;
//
//import lombok.Builder;
//import qwerty.chaekit.domain.member.publisher.PublisherProfile;
//import java.time.LocalDateTime;
//
//@Builder
//public record PublisherInfoResponse(
//        Long publisherId,
//        String publisherName,
//        String profileImageURL,
//        String status,
//        LocalDateTime createdAt
//) {
//    public static PublisherInfoResponse of(PublisherProfile publisher, String profileImageURL) {
//        return PublisherInfoResponse.builder()
//                .publisherId(publisher.getId())
//                .publisherName(publisher.getPublisherName())
//                .profileImageURL(profileImageURL)
//                .status(publisher.getApprovalStatus().name())
//                .createdAt(publisher.getCreatedAt())
//                .build();
//    }
//}