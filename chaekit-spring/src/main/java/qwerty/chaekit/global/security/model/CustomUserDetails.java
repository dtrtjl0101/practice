package qwerty.chaekit.global.security.model;

import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.ArrayList;
import java.util.Collection;

// 1. JWT를 읽을 때 사용
// 2. AuthenticationManager에서 로그인할 때 사용
public class CustomUserDetails implements UserDetails {
    @Getter
    private final Long memberId;
    @Getter
    private final Long userId;
    @Getter
    private final Long publisherId;
    @Getter
    private final String email;
    private final String password;
    private final String role;

    public CustomUserDetails(Long memberId, Long userId, Long publisherId, String username, String password, String role) {
        this.memberId = memberId;
        this.userId = userId;
        this.publisherId = publisherId;
        this.email = username;
        this.password = password;
        this.role = role;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        Collection<GrantedAuthority> collection = new ArrayList<>();
        collection.add((GrantedAuthority) () -> role);
        return collection;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return email;
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
