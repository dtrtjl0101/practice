package qwerty.chaekit.global.init.dummy;

import lombok.Getter;

@Getter
public enum DummyUser {
    LEADER("user1@example.com", "모임지기", "profile-image/user1.webp"),
    USER1("user2@example.com", "유저A", "profile-image/user2.webp"),
    USER2("user3@example.com", "유저B", "profile-image/user3.webp"),
    USER3("user4@example.com", "유저C", "profile-image/user4.webp"),
    ;
    
    DummyUser(
            String email,
            String nickname,
            String profileImageKey
    ) {
        this.email = email;
        this.nickname = nickname;
        this.profileImageKey = profileImageKey;
    }
    
    private final String email;
    private final String nickname;
    private final String profileImageKey;
}
