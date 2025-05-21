package qwerty.chaekit.global.init;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import qwerty.chaekit.domain.member.Member;
import qwerty.chaekit.domain.member.MemberRepository;
import qwerty.chaekit.domain.member.enums.Role;
import qwerty.chaekit.domain.member.publisher.PublisherProfile;
import qwerty.chaekit.domain.member.publisher.PublisherProfileRepository;
import qwerty.chaekit.global.init.dummy.DummyPublisher;
import qwerty.chaekit.service.member.MemberJoinHelper;

@Slf4j
@Component
@RequiredArgsConstructor
public class DummyPublisherFactory {
    private final MemberRepository memberRepository;
    private final PublisherProfileRepository publisherProfileRepository;
    private final MemberJoinHelper memberJoinHelper;
    
    public void saveDummyPublishers() {
        for (DummyPublisher dummyPublisher : DummyPublisher.values()) {
            saveDummyPublisher(dummyPublisher);
        }
    }
    
    public void saveDummyPublisher(DummyPublisher publisherSample) {
        String email = publisherSample.getEmail();
        String publisherName = publisherSample.getPublisherName();
        String profileImageKey = publisherSample.getProfileImageKey();
        String defaultPassword = "0000";
        if (memberRepository.existsByEmail(email)) {
            return;
        }

        Member publisherMember = memberJoinHelper.saveMember(email, defaultPassword, Role.ROLE_PUBLISHER);
        publisherProfileRepository.save(
                PublisherProfile.builder()
                        .member(publisherMember)
                        .publisherName(publisherName)
                        .profileImageKey(profileImageKey)
                        .build()
        );
        
        log.info("출판사 \"{}\"가 생성되었습니다.", publisherName);
    }
}
