package qwerty.chaekit.util;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import qwerty.chaekit.domain.ebook.Ebook;
import qwerty.chaekit.domain.ebook.EbookRepository;
import qwerty.chaekit.domain.group.GroupRepository;
import qwerty.chaekit.domain.group.ReadingGroup;
import qwerty.chaekit.domain.member.Member;
import qwerty.chaekit.domain.member.MemberRepository;
import qwerty.chaekit.domain.member.enums.Role;
import qwerty.chaekit.domain.member.publisher.PublisherProfile;
import qwerty.chaekit.domain.member.publisher.PublisherProfileRepository;
import qwerty.chaekit.domain.member.user.UserProfile;
import qwerty.chaekit.domain.member.user.UserProfileRepository;
import qwerty.chaekit.global.security.resolver.PublisherToken;
import qwerty.chaekit.global.security.resolver.UserToken;

@Component
public class TestFixtureFactory {
    @Autowired private MemberRepository memberRepository;
    @Autowired private UserProfileRepository userProfileRepository;
    @Autowired private PublisherProfileRepository publisherProfileRepository;
    @Autowired private EbookRepository ebookRepository;
    @Autowired
    private GroupRepository groupRepository;

    public UserProfile createUser(String email, String nickname) {
        Member member = createMember(email, Role.ROLE_USER);
        return userProfileRepository.save(
                UserProfile.builder().member(member).nickname(nickname).build()
        );
    }

    public PublisherProfile createPublisher(String email, String publisherName) {
        Member member = createMember(email, Role.ROLE_PUBLISHER);
        return publisherProfileRepository.save(
                PublisherProfile.builder().member(member).publisherName(publisherName).build()
        );
    }

    private Member createMember(String email, Role role) {
        String DEFAULT_PASSWORD = "pw";
        return memberRepository.save(
                Member.builder().email(email).password(DEFAULT_PASSWORD).role(role).build()
        );
    }

    public UserToken createUserToken(Member member, UserProfile user) {
        return UserToken.builder()
                .isAnonymous(false)
                .memberId(member.getId())
                .userId(user.getId())
                .email(member.getEmail())
                .build();
    }

    public PublisherToken createPublisherToken(Member member, PublisherProfile publisher) {
        return PublisherToken.builder()
                .memberId(member.getId())
                .publisherId(publisher.getId())
                .email(member.getEmail())
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

    public ReadingGroup createGroup(String groupName, UserProfile groupLeader) {
        return groupRepository.save(
                ReadingGroup.builder()
                        .name(groupName)
                        .groupLeader(groupLeader)
                        .description("Test group description")
                        .build()
        );
    }
}