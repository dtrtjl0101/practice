package qwerty.chaekit.global.security.model;

import jakarta.annotation.Nullable;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User;
import qwerty.chaekit.domain.member.Member;
import qwerty.chaekit.domain.member.user.UserProfile;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.Map;

// 1. JWT를 읽을 때 사용
// 2. AuthenticationManager에서 로그인할 때 사용
public record CustomUserDetails(
        @Nullable Member member,
        @Nullable UserProfile user,
        Map<String, Object> attributes
) implements UserDetails, OAuth2User {
    public CustomUserDetails(Member member, @Nullable UserProfile user) {
        this(member, user,Collections.emptyMap());
    }
    
    public static CustomUserDetails anonymous() {
        return new CustomUserDetails(null, null);
    }

    @Override
    public Map<String, Object> getAttributes() {
        return attributes;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        if (member == null) {
            return Collections.emptyList();
        }
        Collection<GrantedAuthority> collection = new ArrayList<>();
        collection.add((GrantedAuthority) () -> member.getRole().name());
        return collection;
    }

    @Override
    public String getPassword() {
        return member == null ? null : member.getPassword();
    }

    @Override
    public String getUsername() {
        return member == null ? null : member.getEmail();
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

    // returns the email
    @Override
    public String getName() {
        return (String) attributes.getOrDefault("email", getUsername());
    }
}
