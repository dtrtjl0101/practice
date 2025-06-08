package qwerty.chaekit.global.init.dummy;

import lombok.Getter;

@Getter
public enum DummyPublisher {
    PUBLISHER1("publisher1@example.com", "출판사A", "profile-image/publisher1.webp)"),
    PUBLISHER2("publisher2@example.com", "출판사B", "profile-image/publisher2.webp"),
    PUBLISHER3("publisher3@example.com", "출판사C", "profile-image/publisher3.webp"),
    ;
    
    DummyPublisher(
            String email,
            String publisherName,
            String profileImageKey
    ) {
        this.email = email;
        this.publisherName = publisherName;
        this.profileImageKey = profileImageKey;
    }
    
    private final String email;
    private final String publisherName;
    private final String profileImageKey;
}
