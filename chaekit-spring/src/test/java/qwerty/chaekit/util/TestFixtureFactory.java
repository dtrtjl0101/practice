package qwerty.chaekit.util;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import qwerty.chaekit.domain.ebook.Ebook;
import qwerty.chaekit.domain.ebook.EbookRepository;
import qwerty.chaekit.domain.member.Member;
import qwerty.chaekit.domain.member.MemberRepository;
import qwerty.chaekit.domain.member.enums.Role;
import qwerty.chaekit.domain.member.publisher.PublisherProfile;
import qwerty.chaekit.domain.member.publisher.PublisherProfileRepository;
import qwerty.chaekit.domain.member.user.UserProfile;
import qwerty.chaekit.domain.member.user.UserProfileRepository;
import qwerty.chaekit.global.security.resolver.LoginMember;

@Component
public class TestFixtureFactory {
    @Autowired private MemberRepository memberRepository;
    @Autowired private UserProfileRepository userProfileRepository;
    @Autowired private PublisherProfileRepository publisherProfileRepository;
    @Autowired private EbookRepository ebookRepository;

    public UserProfile createUser(String username, String nickname) {
        Member member = createMember(username, Role.ROLE_USER);
        return userProfileRepository.save(
                UserProfile.builder().member(member).nickname(nickname).build()
        );
    }

    public PublisherProfile createPublisher(String username, String publisherName) {
        Member member = createMember(username, Role.ROLE_PUBLISHER);
        return publisherProfileRepository.save(
                PublisherProfile.builder().member(member).publisherName(publisherName).build()
        );
    }

    private Member createMember(String username, Role role) {
        String DEFAULT_PASSWORD = "pw";
        return memberRepository.save(
                Member.builder().username(username).password(DEFAULT_PASSWORD).role(role).build()
        );
    }

    public LoginMember createLoginMember(Member member, Role role) {
        return LoginMember.builder()
                .memberId(member.getId())
                .username(member.getUsername())
                .role(role.name())
                .build();
    }

    public Ebook createEbook(String title, PublisherProfile publisher, String authorName, String description, String fileKey) {
        return ebookRepository.save(
                Ebook.builder()
                        .title(title)
                        .author(authorName)
                        .description(description)
                        .size(2 * 1024 * 1024)
                        .fileKey(fileKey)
                        .publisher(publisher).build()
        );
    }
}