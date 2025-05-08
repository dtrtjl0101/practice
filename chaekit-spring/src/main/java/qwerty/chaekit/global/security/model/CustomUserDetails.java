package qwerty.chaekit.global.security.model;

import jakarta.annotation.Nullable;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import qwerty.chaekit.domain.member.Member;
import qwerty.chaekit.domain.member.publisher.PublisherProfile;
import qwerty.chaekit.domain.member.user.UserProfile;

import java.util.ArrayList;
import java.util.Collection;

// 1. JWT를 읽을 때 사용
// 2. AuthenticationManager에서 로그인할 때 사용
public record CustomUserDetails(
        Member member,
        @Nullable UserProfile user,
        @Nullable PublisherProfile publisher
) implements UserDetails {
    public static CustomUserDetails anonymous() {
        return new CustomUserDetails(null, null, null);
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        Collection<GrantedAuthority> collection = new ArrayList<>();
        collection.add((GrantedAuthority) () -> member.getRole().name());
        return collection;
    }

    @Override
    public String getPassword() {
        return member.getPassword();
    }

    @Override
    public String getUsername() {
        return member.getEmail();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
